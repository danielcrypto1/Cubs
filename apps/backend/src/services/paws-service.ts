import { prisma } from "../lib/prisma.js";
import { economyEvents } from "../lib/economy-events.js";
import type { Prisma, PawsReason } from "@prisma/client";
import type { PawsBalanceResult, PawsOperationResult, PawsTransaction } from "@cubs/shared";

// ─── Error Codes ───────────────────────────────────────

export class PawsError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "PawsError";
  }
}

// ─── Advisory Lock ──────────────────────────────────────
//
// pg_advisory_xact_lock hashes the userId to a 64-bit int.
// The lock is held for the duration of the transaction and
// automatically released on COMMIT/ROLLBACK.
//
// This prevents two concurrent transactions for the same user
// from producing a negative balance via interleaved reads.
// ─────────────────────────────────────────────────────────

function userLockId(userId: string): bigint {
  // FNV-1a hash → 63-bit positive bigint (pg advisory lock takes bigint)
  let h = 0xcbf29ce484222325n;
  for (let i = 0; i < userId.length; i++) {
    h ^= BigInt(userId.charCodeAt(i));
    h = (h * 0x100000001b3n) & 0x7fffffffffffffffn;
  }
  return h;
}

async function acquireLock(tx: Prisma.TransactionClient, userId: string): Promise<void> {
  const lockId = userLockId(userId);
  await tx.$queryRawUnsafe(`SELECT pg_advisory_xact_lock(${lockId})`);
}

// ─── Balance (derived from ledger — never cached) ───────

async function sumBalance(client: Prisma.TransactionClient | typeof prisma, userId: string): Promise<number> {
  const result = await client.pawsTransaction.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

// ─── Public API ─────────────────────────────────────────

/**
 * Returns the current PAWS balance for a user.
 * Balance = SUM(amount) FROM paws_transactions WHERE user_id = userId
 */
export async function getBalance(userId: string): Promise<PawsBalanceResult> {
  const balance = await sumBalance(prisma, userId);
  return { balance };
}

/**
 * Returns paginated transaction history for a user, newest first.
 */
export async function getHistory(
  userId: string,
  options?: { page?: number; limit?: number },
): Promise<{ transactions: PawsTransaction[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.min(100, Math.max(1, options?.limit ?? 50));

  const [rows, total] = await Promise.all([
    prisma.pawsTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pawsTransaction.count({ where: { userId } }),
  ]);

  const transactions: PawsTransaction[] = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    amount: r.amount,
    reason: r.reason,
    referenceId: r.referenceId,
    note: r.note,
    createdAt: r.createdAt.toISOString(),
  }));

  return { transactions, total, page, limit };
}

/**
 * Credits PAWS to a user's ledger.
 * Advisory-locked when inside a transaction to prevent race conditions.
 *
 * @param userId   - target user
 * @param amount   - positive integer
 * @param reason   - PawsReason enum value
 * @param opts     - optional referenceId, note, and transaction client
 */
export async function credit(
  userId: string,
  amount: number,
  reason: PawsReason,
  opts?: { referenceId?: string; note?: string; tx?: Prisma.TransactionClient },
): Promise<PawsOperationResult> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new PawsError("INVALID_AMOUNT", "Credit amount must be a positive integer");
  }

  const execute = async (tx: Prisma.TransactionClient) => {
    await acquireLock(tx, userId);
    return executeCredit(tx, userId, amount, reason, opts?.referenceId, opts?.note);
  };

  // If a tx is provided, use it directly (caller owns the transaction)
  if (opts?.tx) {
    return execute(opts.tx);
  }

  // Otherwise, open our own transaction
  const result = await prisma.$transaction(execute);

  // Emit event outside the transaction (fire-and-forget)
  economyEvents.emit("paws_earned", {
    userId,
    data: { amount, reason, referenceId: opts?.referenceId, transactionId: result.transactionId },
  });

  return result;
}

/**
 * Debits PAWS from a user's ledger.
 * Advisory-locked. Throws if insufficient balance.
 *
 * @param userId   - target user
 * @param amount   - positive integer (will be stored as negative)
 * @param reason   - PawsReason enum value
 * @param opts     - optional referenceId, note, and transaction client
 */
export async function debit(
  userId: string,
  amount: number,
  reason: PawsReason,
  opts?: { referenceId?: string; note?: string; tx?: Prisma.TransactionClient },
): Promise<PawsOperationResult> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new PawsError("INVALID_AMOUNT", "Debit amount must be a positive integer");
  }

  const execute = async (tx: Prisma.TransactionClient) => {
    await acquireLock(tx, userId);
    return executeDebit(tx, userId, amount, reason, opts?.referenceId, opts?.note);
  };

  if (opts?.tx) {
    return execute(opts.tx);
  }

  const result = await prisma.$transaction(execute);

  economyEvents.emit("paws_spent", {
    userId,
    data: { amount, reason, referenceId: opts?.referenceId, transactionId: result.transactionId },
  });

  return result;
}

// ─── Internal Helpers ───────────────────────────────────

async function executeCredit(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
  reason: PawsReason,
  referenceId?: string,
  note?: string,
): Promise<PawsOperationResult> {
  const record = await tx.pawsTransaction.create({
    data: { userId, amount, reason, referenceId, note },
  });

  const newBalance = await sumBalance(tx, userId);

  return {
    transactionId: record.id,
    newBalance,
    amount,
    reason,
  };
}

async function executeDebit(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
  reason: PawsReason,
  referenceId?: string,
  note?: string,
): Promise<PawsOperationResult> {
  // Check balance UNDER LOCK — no race condition possible
  const currentBalance = await sumBalance(tx, userId);
  if (currentBalance < amount) {
    throw new PawsError(
      "INSUFFICIENT_BALANCE",
      `Insufficient PAWS balance: have ${currentBalance}, need ${amount}`,
    );
  }

  const record = await tx.pawsTransaction.create({
    data: { userId, amount: -amount, reason, referenceId, note },
  });

  const newBalance = currentBalance - amount;

  return {
    transactionId: record.id,
    newBalance,
    amount: -amount,
    reason,
  };
}

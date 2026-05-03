import { prisma } from "../lib/prisma.js";
import type { Prisma, IntentType } from "@prisma/client";

// ─── Transaction Intent Service ────────────────────────
//
// Prevents double-clicks, race conditions, and duplicate
// reward distribution by enforcing single-flight execution.
//
// Flow:
//   1. create() — inserts PENDING intent, rejects if one exists
//   2. caller executes the critical action
//   3. complete() or fail() — marks the intent as done
//
// Stale PENDING intents auto-expire after INTENT_TTL_MS.
// locked_until provides a hard lock window during which
// no new intent of the same type+reference can be created.
// ─────────────────────────────────────────────────────────

/** PENDING intents older than this are considered stale and eligible for cleanup */
const INTENT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Hard lock duration — prevents new intent creation for same user+type+ref */
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export class IntentError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "IntentError";
  }
}

/**
 * Creates a new transaction intent. Rejects if the user already
 * has a non-expired PENDING intent of the same type+reference
 * whose lock window has not elapsed.
 *
 * @returns The intent ID to pass to complete() or fail()
 */
export async function createIntent(
  userId: string,
  type: IntentType,
  referenceId?: string,
  tx?: Prisma.TransactionClient,
): Promise<string> {
  const client = tx ?? prisma;
  const now = new Date();

  // Check for existing PENDING intent of same type+reference
  // that hasn't expired AND whose lock is still active
  const existing = await client.transactionIntent.findFirst({
    where: {
      userId,
      type,
      status: "PENDING",
      referenceId: referenceId ?? null,
      lockedUntil: { gt: now },
    },
  });

  if (existing) {
    const remainingMs = existing.lockedUntil.getTime() - now.getTime();
    const remainingSec = Math.ceil(remainingMs / 1000);
    throw new IntentError(
      "INTENT_ALREADY_PENDING",
      `A ${type} operation is already in progress. Locked for ${remainingSec}s.`,
    );
  }

  const expiresAt = new Date(now.getTime() + INTENT_TTL_MS);
  const lockedUntil = new Date(now.getTime() + LOCK_DURATION_MS);

  const intent = await client.transactionIntent.create({
    data: {
      userId,
      type,
      status: "PENDING",
      referenceId: referenceId ?? null,
      expiresAt,
      lockedUntil,
    },
  });

  return intent.id;
}

/**
 * Marks an intent as COMPLETED with optional result data.
 * Clears the lock window so future intents can proceed immediately.
 */
export async function completeIntent(
  intentId: string,
  result?: Record<string, unknown>,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const client = tx ?? prisma;

  await client.transactionIntent.update({
    where: { id: intentId },
    data: {
      status: "COMPLETED",
      result: result ? (result as Prisma.InputJsonValue) : undefined,
      completedAt: new Date(),
      lockedUntil: new Date(), // release lock immediately on success
    },
  });
}

/**
 * Marks an intent as FAILED with an error message.
 * Clears the lock window so the user can retry immediately.
 */
export async function failIntent(
  intentId: string,
  error: string,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const client = tx ?? prisma;

  await client.transactionIntent.update({
    where: { id: intentId },
    data: {
      status: "FAILED",
      error,
      completedAt: new Date(),
      lockedUntil: new Date(), // release lock immediately on failure
    },
  });
}

/**
 * Wraps a critical operation with intent protection.
 * Automatically creates, completes, or fails the intent.
 *
 * @param userId      - user performing the action
 * @param type        - intent type
 * @param referenceId - optional dedup key (e.g. crateDefinitionId)
 * @param action      - the critical function to execute (receives intentId)
 * @returns The result of the action
 */
export async function withIntent<T>(
  userId: string,
  type: IntentType,
  referenceId: string | undefined,
  action: (intentId: string) => Promise<T>,
): Promise<T> {
  const intentId = await createIntent(userId, type, referenceId);

  try {
    const result = await action(intentId);

    // Complete the intent (best-effort — action already succeeded)
    await completeIntent(intentId, typeof result === "object" && result !== null ? result as Record<string, unknown> : undefined).catch((err) => {
      console.error(`Failed to complete intent ${intentId}:`, err);
    });

    return result;
  } catch (err) {
    // Fail the intent (best-effort — we want to throw the original error)
    const message = err instanceof Error ? err.message : "Unknown error";
    await failIntent(intentId, message).catch((failErr) => {
      console.error(`Failed to fail intent ${intentId}:`, failErr);
    });

    throw err;
  }
}

/**
 * Cleans up expired PENDING intents.
 * Should be called periodically (e.g. cron or on-demand).
 */
export async function cleanupExpiredIntents(): Promise<number> {
  const result = await prisma.transactionIntent.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: new Date() },
    },
    data: {
      status: "FAILED",
      error: "Intent expired (process may have crashed)",
      completedAt: new Date(),
      lockedUntil: new Date(), // release lock on cleanup
    },
  });

  return result.count;
}

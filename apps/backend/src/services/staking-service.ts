import { prisma } from "../lib/prisma.js";
import { credit } from "./paws-service.js";
import { withIntent } from "./transaction-intent-service.js";
import { economyEvents } from "../lib/economy-events.js";
import type { Prisma } from "@prisma/client";
import type { StakingAccrual, StakingClaimResult } from "@cubs/shared";

// ─── Constants ─────────────────────────────────────────

/** Minimum hours between claims (cooldown) */
const CLAIM_COOLDOWN_HOURS = 6;

// ─── Snapshot Calculation ───────────────────────────────
//
// Snapshots are baked-in rates stored on the staking position.
// They are recalculated ONLY when equipped traits change, the
// cub transfers, or the cub is listed/delisted.
//
// rateSnapshot   = basePawsRate * rarityMultiplier
// flatBonusSnapshot = Σ(PAWS_FLAT boostValue) from equipped traits
//
// At claim time we just read snapshots — no live recalculation.
// ─────────────────────────────────────────────────────────

async function calculateSnapshot(
  cubId: string,
  client: Prisma.TransactionClient | typeof prisma = prisma,
) {
  const cub = await client.cub.findUniqueOrThrow({
    where: { id: cubId },
    include: { equippedTraits: { include: { traitDefinition: true } } },
  });

  const config = await client.economyConfig.findUniqueOrThrow({ where: { id: 1 } });
  const multipliers = config.rarityMultipliers as Record<string, number>;

  const rarityMult = multipliers[cub.rarity] ?? 1.0;
  const rateSnapshot = config.basePawsRate * rarityMult;

  let flatBonusSnapshot = 0;
  for (const eq of cub.equippedTraits) {
    if (eq.traitDefinition.boostType === "PAWS_FLAT") {
      flatBonusSnapshot += eq.traitDefinition.boostValue;
    }
  }

  return { rateSnapshot, flatBonusSnapshot };
}

// ─── Accrual Math (pure, from snapshot) ─────────────────

function computeAccrual(position: {
  lastClaimedAt: Date;
  rateSnapshot: number;
  flatBonusSnapshot: number;
  isActive: boolean;
}): { dailyPaws: number; hoursAccrued: number; accruedPaws: number } {
  if (!position.isActive) {
    return { dailyPaws: 0, hoursAccrued: 0, accruedPaws: 0 };
  }

  const now = new Date();
  const hoursAccrued = (now.getTime() - position.lastClaimedAt.getTime()) / (1000 * 60 * 60);
  const daysAccrued = hoursAccrued / 24;
  const dailyPaws = position.rateSnapshot + position.flatBonusSnapshot;
  const accruedPaws = Math.floor(dailyPaws * daysAccrued);

  return { dailyPaws, hoursAccrued, accruedPaws };
}

// ─── Error Class ───────────────────────────────────────

export class StakingError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "StakingError";
  }
}

// ─── Public API ─────────────────────────────────────────

/**
 * Returns the accrued (unclaimed) PAWS for all of a user's staked cubs.
 * Uses snapshot fields only — no live trait recalculation.
 */
export async function getAccrued(userId: string): Promise<{
  totalAccrued: number;
  perCub: StakingAccrual[];
  cooldownRemaining: number;
}> {
  const positions = await prisma.stakingPosition.findMany({
    where: { userId, isActive: true },
    include: {
      cub: { select: { id: true, tokenId: true, name: true, rarity: true } },
    },
  });

  const config = await prisma.economyConfig.findUniqueOrThrow({ where: { id: 1 } });
  const multipliers = config.rarityMultipliers as Record<string, number>;

  let totalAccrued = 0;
  let earliestClaimAt: Date | null = null;
  const perCub: StakingAccrual[] = [];

  for (const pos of positions) {
    const { dailyPaws, hoursAccrued, accruedPaws } = computeAccrual(pos);
    totalAccrued += accruedPaws;

    // Track the most recent claim for cooldown calculation
    if (!earliestClaimAt || pos.lastClaimedAt > earliestClaimAt) {
      earliestClaimAt = pos.lastClaimedAt;
    }

    perCub.push({
      cubId: pos.cub.id,
      tokenId: pos.cub.tokenId,
      cubName: pos.cub.name,
      rarity: pos.cub.rarity,
      baseRate: config.basePawsRate,
      rarityMultiplier: multipliers[pos.cub.rarity] ?? 1.0,
      traitMultiplier: 1, // multiplier boosts are future-phase
      traitFlat: pos.flatBonusSnapshot,
      pawsPerDay: dailyPaws,
      hoursAccrued,
      accruedPaws,
    });
  }

  // Calculate cooldown remaining (seconds)
  let cooldownRemaining = 0;
  if (earliestClaimAt) {
    const cooldownEnd = new Date(earliestClaimAt.getTime() + CLAIM_COOLDOWN_HOURS * 60 * 60 * 1000);
    const remaining = cooldownEnd.getTime() - Date.now();
    cooldownRemaining = Math.max(0, Math.ceil(remaining / 1000));
  }

  return { totalAccrued, perCub, cooldownRemaining };
}

/**
 * Claims all accrued PAWS across all of a user's active staking positions.
 * Protected by transaction intent (prevents double-claim).
 * Enforces cooldown period between claims.
 */
export async function claimAll(userId: string): Promise<StakingClaimResult> {
  return withIntent(userId, "STAKING_CLAIM", undefined, async () => {
    return prisma.$transaction(async (tx) => {
      const positions = await tx.stakingPosition.findMany({
        where: { userId, isActive: true },
        include: {
          cub: { select: { id: true, tokenId: true, name: true, rarity: true } },
        },
      });

      if (positions.length === 0) {
        throw new StakingError("NO_POSITIONS", "No active staking positions found");
      }

      // Cooldown check: ensure minimum time has passed since last claim
      const cooldownMs = CLAIM_COOLDOWN_HOURS * 60 * 60 * 1000;
      const now = Date.now();
      for (const pos of positions) {
        const timeSinceClaim = now - pos.lastClaimedAt.getTime();
        if (timeSinceClaim < cooldownMs) {
          const remainingSeconds = Math.ceil((cooldownMs - timeSinceClaim) / 1000);
          throw new StakingError(
            "CLAIM_COOLDOWN",
            `Claim cooldown active. Try again in ${remainingSeconds} seconds.`,
          );
        }
      }

      const config = await tx.economyConfig.findUniqueOrThrow({ where: { id: 1 } });
      const multipliers = config.rarityMultipliers as Record<string, number>;

      let totalClaimed = 0;
      const perCub: StakingAccrual[] = [];

      for (const pos of positions) {
        const { dailyPaws, hoursAccrued, accruedPaws } = computeAccrual(pos);

        if (accruedPaws > 0) {
          // Credit via paws-service inside our transaction (advisory-locked)
          await credit(userId, accruedPaws, "STAKING_REWARD", {
            referenceId: pos.cubId,
            note: `Staking claim: Cub #${pos.cub.tokenId}`,
            tx,
          });
          totalClaimed += accruedPaws;
        }

        // Reset claim timer
        await tx.stakingPosition.update({
          where: { id: pos.id },
          data: { lastClaimedAt: new Date() },
        });

        perCub.push({
          cubId: pos.cub.id,
          tokenId: pos.cub.tokenId,
          cubName: pos.cub.name,
          rarity: pos.cub.rarity,
          baseRate: config.basePawsRate,
          rarityMultiplier: multipliers[pos.cub.rarity] ?? 1.0,
          traitMultiplier: 1,
          traitFlat: pos.flatBonusSnapshot,
          pawsPerDay: dailyPaws,
          hoursAccrued,
          accruedPaws,
        });
      }

      // Get new balance after all credits
      const balanceResult = await tx.pawsTransaction.aggregate({
        where: { userId },
        _sum: { amount: true },
      });
      const newBalance = balanceResult._sum.amount ?? 0;

      // Emit event (will run after transaction commits)
      const result: StakingClaimResult = { totalClaimed, newBalance, perCub };

      economyEvents.emit("staking_claimed", {
        userId,
        data: {
          totalClaimed,
          newBalance,
          cubCount: positions.length,
        },
      });

      return result;
    });
  });
}

// ─── Snapshot Hooks (called by other services) ──────────

/**
 * Auto-claims any accrued PAWS and then updates the snapshot.
 * MUST be called before any event that changes the staking rate:
 *   - trait equip / unequip
 *   - cub transfer
 *   - marketplace listing
 */
export async function autoClaimAndUpdateSnapshot(
  cubId: string,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const client = tx ?? prisma;

  const position = await client.stakingPosition.findUnique({
    where: { cubId },
  });

  if (!position) return;

  // 1. Claim accrued PAWS via paws-service (advisory-locked)
  const { accruedPaws } = computeAccrual(position);
  if (accruedPaws > 0) {
    await credit(position.userId, accruedPaws, "STAKING_REWARD", {
      referenceId: cubId,
      note: "Auto-claim before snapshot update",
      ...(tx ? { tx } : {}),
    });
  }

  // 2. Recalculate snapshot from current equipped traits
  const { rateSnapshot, flatBonusSnapshot } = await calculateSnapshot(cubId, client);

  // 3. Update position with new snapshot + reset claim timer
  await client.stakingPosition.update({
    where: { cubId },
    data: {
      lastClaimedAt: new Date(),
      rateSnapshot,
      flatBonusSnapshot,
      snapshotAt: new Date(),
    },
  });
}

/**
 * Pauses staking for a cub (e.g. when listed on marketplace).
 * Auto-claims first so no PAWS are lost.
 */
export async function pauseStaking(
  cubId: string,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  await autoClaimAndUpdateSnapshot(cubId, tx);

  const client = tx ?? prisma;
  await client.stakingPosition.updateMany({
    where: { cubId, isActive: true },
    data: { isActive: false },
  });
}

/**
 * Resumes staking for a cub (e.g. when delisted from marketplace).
 * Resets claim timer and recalculates snapshot.
 */
export async function resumeStaking(
  cubId: string,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const client = tx ?? prisma;
  const { rateSnapshot, flatBonusSnapshot } = await calculateSnapshot(cubId, client);

  await client.stakingPosition.updateMany({
    where: { cubId, isActive: false },
    data: {
      isActive: true,
      lastClaimedAt: new Date(),
      rateSnapshot,
      flatBonusSnapshot,
      snapshotAt: new Date(),
    },
  });
}

/**
 * Transfers staking position to a new owner (on cub sale).
 * Auto-claims for the seller, then reassigns to buyer.
 */
export async function transferStaking(
  cubId: string,
  newUserId: string,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  await autoClaimAndUpdateSnapshot(cubId, tx);

  const client = tx ?? prisma;
  await client.stakingPosition.updateMany({
    where: { cubId },
    data: {
      userId: newUserId,
      lastClaimedAt: new Date(),
      isActive: true,
    },
  });
}

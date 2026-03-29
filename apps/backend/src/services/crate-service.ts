import { prisma } from "../lib/prisma.js";
import { credit, debit, PawsError } from "./paws-service.js";
import { withIntent } from "./transaction-intent-service.js";
import { economyEvents } from "../lib/economy-events.js";
import { checkRateLimit, RateLimitError } from "../lib/rate-limiter.js";
import { crateQueue } from "../lib/queue.js";
import type { Prisma, RewardType, TraitRarity, CubRarity } from "@prisma/client";
import type { CrateOpenResult, CrateRewardResult, TraitDefinition } from "@cubs/shared";

// ─── Constants ─────────────────────────────────────────

/** Soft pity: after this many opens, boost high-rarity weights */
const SOFT_PITY_THRESHOLD = 20;

/** Hard pity: after this many opens, GUARANTEE LEGENDARY */
const HARD_PITY_THRESHOLD = 50;

/** High rarities that reset the pity counter */
const HIGH_RARITIES: Set<string> = new Set(["EPIC", "LEGENDARY"]);

/** Soft pity rarity weights (boosted EPIC + LEGENDARY) */
const SOFT_PITY_WEIGHTS: { rarity: TraitRarity; weight: number }[] = [
  { rarity: "EPIC", weight: 70 },
  { rarity: "LEGENDARY", weight: 30 },
];

/** Rate limits (Redis-backed sliding window) */
const RATE_LIMITS = {
  CRATE_OPEN: { max: 10, windowSec: 60 },       // 10 opens/min
  CRATE_PURCHASE: { max: 5, windowSec: 60 },     // 5 purchases/min
} as const;

// ─── Read-only queries ──────────────────────────────────

export async function findUserCrates(walletAddress: string) {
  return prisma.userCrate.findMany({
    where: { walletAddress: walletAddress.toLowerCase() },
    include: { crateDefinition: true },
    orderBy: { crateDefinition: { rarity: "asc" } },
  });
}

export async function findAllCrateDefinitions() {
  return prisma.crateDefinition.findMany({
    orderBy: { rarity: "asc" },
  });
}

export async function getLootTable(crateDefinitionId: string) {
  return prisma.crateReward.findMany({
    where: { crateDefinitionId, isActive: true },
    include: { traitDefinition: true },
    orderBy: { weight: "desc" },
  });
}

// ─── Crate Purchase ────────────────────────────────────
//
// Validates the crate is purchasable, checks supply,
// debits PAWS (if PAWS-priced), and adds to user inventory.
// ─────────────────────────────────────────────────────────

export async function purchaseCrate(
  userId: string,
  walletAddress: string,
  crateDefinitionId: string,
  quantity: number = 1,
): Promise<{ success: boolean; quantity: number; newBalance?: number }> {
  const address = walletAddress.toLowerCase();

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new CrateError("INVALID_QUANTITY", "Quantity must be between 1 and 10");
  }

  // Redis rate limit check
  await checkRateLimit(
    `crate_purchase:${userId}`,
    RATE_LIMITS.CRATE_PURCHASE.max,
    RATE_LIMITS.CRATE_PURCHASE.windowSec,
  );

  return withIntent(userId, "CRATE_PURCHASE", crateDefinitionId, async () => {
    return prisma.$transaction(async (tx) => {
      // 1. Validate crate definition is active and purchasable
      const crateDef = await tx.crateDefinition.findUnique({
        where: { id: crateDefinitionId },
      });

      if (!crateDef || !crateDef.isActive) {
        throw new CrateError("CRATE_NOT_FOUND", "Crate not found or not active");
      }

      const now = new Date();
      if (crateDef.activeFrom && now < crateDef.activeFrom) {
        throw new CrateError("CRATE_NOT_ACTIVE", "This crate is not yet available");
      }
      if (crateDef.activeUntil && now > crateDef.activeUntil) {
        throw new CrateError("CRATE_EXPIRED", "This crate is no longer available");
      }

      // 2. Check supply
      if (crateDef.maxSupply !== null) {
        const remaining = crateDef.maxSupply - crateDef.currentSupply;
        if (remaining < quantity) {
          throw new CrateError("SUPPLY_EXHAUSTED", `Only ${remaining} crates remaining`);
        }

        await tx.crateDefinition.update({
          where: { id: crateDefinitionId },
          data: { currentSupply: { increment: quantity } },
        });
      }

      // 3. Debit PAWS if PAWS-priced
      let newBalance: number | undefined;
      if (crateDef.priceType === "PAWS") {
        const price = parseInt(crateDef.priceAmount, 10);
        if (isNaN(price) || price <= 0) {
          throw new CrateError("INVALID_PRICE", "Crate has invalid price configuration");
        }
        const totalCost = price * quantity;

        const result = await debit(userId, totalCost, "CRATE_PURCHASE", {
          referenceId: crateDefinitionId,
          note: `Purchase ${quantity}x ${crateDef.name}`,
          tx,
        });
        newBalance = result.newBalance;
      }
      // ETH/USDT purchases would be validated on-chain — not handled here

      // 4. Add to user inventory
      await tx.userCrate.upsert({
        where: {
          walletAddress_crateDefinitionId: {
            walletAddress: address,
            crateDefinitionId,
          },
        },
        update: { quantity: { increment: quantity } },
        create: {
          walletAddress: address,
          crateDefinitionId,
          quantity,
        },
      });

      const result = { success: true as const, quantity, newBalance };

      // Emit event
      economyEvents.emit("crate_purchased", {
        userId,
        data: { crateDefinitionId, quantity, cost: crateDef.priceAmount, priceType: crateDef.priceType },
      });

      return result;
    });
  });
}

// ─── Weighted Reward Selection ──────────────────────────

interface SelectedReward {
  rewardType: RewardType;
  traitDefinitionId: string | null;
  traitRarity: TraitRarity | null;
  pawsAmount: number | null;
  cubRarity: CubRarity | null;
}

async function selectReward(
  crateDefinitionId: string,
  pityOverrideRarity: TraitRarity | null,
  maxRetries = 5,
): Promise<SelectedReward> {
  const rewards = await prisma.crateReward.findMany({
    where: { crateDefinitionId, isActive: true },
  });

  if (rewards.length === 0) {
    throw new CrateError("NO_REWARDS", "No rewards configured for this crate");
  }

  // If pity triggered, filter to only TRAIT rewards at the forced rarity
  // or if no matching TRAIT reward exists, find any TRAIT at the pity rarity
  if (pityOverrideRarity) {
    const traitRewards = rewards.filter(
      (r) => r.rewardType === "TRAIT" && r.traitRarity === pityOverrideRarity,
    );

    if (traitRewards.length > 0) {
      // Pick a random trait reward at the pity rarity
      const selected = traitRewards[Math.floor(Math.random() * traitRewards.length)];
      const traitId = await resolveTraitReward(selected.traitDefinitionId, pityOverrideRarity);
      if (traitId) {
        return {
          rewardType: "TRAIT",
          traitDefinitionId: traitId,
          traitRarity: pityOverrideRarity,
          pawsAmount: null,
          cubRarity: null,
        };
      }
    }
    // Fallback: find any available trait at this rarity even if not in crate rewards
    const fallbackTrait = await resolveTraitReward(null, pityOverrideRarity);
    if (fallbackTrait) {
      return {
        rewardType: "TRAIT",
        traitDefinitionId: fallbackTrait,
        traitRarity: pityOverrideRarity,
        pawsAmount: null,
        cubRarity: null,
      };
    }
    // If no trait available at pity rarity, fall through to normal selection
  }

  const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const roll = Math.random() * totalWeight;
    let cumulative = 0;
    let selected = rewards[0];

    for (const reward of rewards) {
      cumulative += reward.weight;
      if (roll <= cumulative) {
        selected = reward;
        break;
      }
    }

    switch (selected.rewardType) {
      case "TRAIT": {
        const traitId = await resolveTraitReward(selected.traitDefinitionId, selected.traitRarity);
        if (!traitId) continue;
        return {
          rewardType: "TRAIT",
          traitDefinitionId: traitId,
          traitRarity: selected.traitRarity,
          pawsAmount: null,
          cubRarity: null,
        };
      }

      case "PAWS": {
        const amount = resolvePawsAmount(selected.pawsAmount, selected.pawsMin, selected.pawsMax);
        return {
          rewardType: "PAWS",
          traitDefinitionId: null,
          traitRarity: null,
          pawsAmount: amount,
          cubRarity: null,
        };
      }

      case "CUB": {
        return {
          rewardType: "CUB",
          traitDefinitionId: null,
          traitRarity: null,
          pawsAmount: null,
          cubRarity: selected.cubRarity,
        };
      }

      default:
        continue;
    }
  }

  throw new CrateError("REWARDS_EXHAUSTED", "No available rewards after multiple attempts — all supply may be exhausted");
}

async function resolveTraitReward(
  specificId: string | null,
  rarity: TraitRarity | null,
): Promise<string | null> {
  if (specificId) {
    const def = await prisma.traitDefinition.findUnique({ where: { id: specificId } });
    if (def && def.currentSupply < def.maxSupply) return specificId;
    return null;
  }

  if (!rarity) return null;

  const traits = await prisma.traitDefinition.findMany({
    where: { rarity, isActive: true },
  });
  const mintable = traits.filter((t) => t.currentSupply < t.maxSupply);
  if (mintable.length === 0) return null;

  return mintable[Math.floor(Math.random() * mintable.length)].id;
}

function resolvePawsAmount(
  fixed: number | null,
  min: number | null,
  max: number | null,
): number {
  if (fixed != null && fixed > 0) return fixed;
  if (min != null && max != null) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return 0;
}

// ─── Pity System ───────────────────────────────────────
//
// Two-tier pity:
//   Soft pity (20 opens): weighted random — 70% EPIC, 30% LEGENDARY
//   Hard pity (50 opens): GUARANTEED LEGENDARY
// Counter resets whenever an EPIC or LEGENDARY is awarded.
// ─────────────────────────────────────────────────────────

interface PityResult {
  /** The forced rarity, or null if no pity triggered */
  forcedRarity: TraitRarity | null;
  /** Which tier triggered: "soft", "hard", or null */
  tier: "soft" | "hard" | null;
}

async function checkPity(
  userId: string,
  crateDefinitionId: string,
): Promise<PityResult> {
  const stats = await prisma.crateOpenStats.findUnique({
    where: {
      userId_crateDefinitionId: {
        userId,
        crateDefinitionId,
      },
    },
  });

  if (!stats) return { forcedRarity: null, tier: null };

  // HARD PITY: 50 opens → GUARANTEED LEGENDARY
  if (stats.opensSinceLastHighRarity >= HARD_PITY_THRESHOLD) {
    return { forcedRarity: "LEGENDARY", tier: "hard" };
  }

  // SOFT PITY: 20 opens → weighted random (EPIC 70%, LEGENDARY 30%)
  if (stats.opensSinceLastHighRarity >= SOFT_PITY_THRESHOLD) {
    const totalWeight = SOFT_PITY_WEIGHTS.reduce((s, r) => s + r.weight, 0);
    const roll = Math.random() * totalWeight;
    let cumulative = 0;
    for (const entry of SOFT_PITY_WEIGHTS) {
      cumulative += entry.weight;
      if (roll <= cumulative) {
        return { forcedRarity: entry.rarity, tier: "soft" };
      }
    }
    return { forcedRarity: "EPIC", tier: "soft" }; // fallback
  }

  return { forcedRarity: null, tier: null };
}

/**
 * Updates pity tracking after a reward is distributed.
 */
async function updatePityStats(
  tx: Prisma.TransactionClient,
  userId: string,
  crateDefinitionId: string,
  rewardRarity: string | null,
): Promise<boolean> {
  const isHighRarity = rewardRarity !== null && HIGH_RARITIES.has(rewardRarity);

  await tx.crateOpenStats.upsert({
    where: {
      userId_crateDefinitionId: {
        userId,
        crateDefinitionId,
      },
    },
    update: {
      totalOpens: { increment: 1 },
      opensSinceLastHighRarity: isHighRarity ? 0 : { increment: 1 },
    },
    create: {
      userId,
      crateDefinitionId,
      totalOpens: 1,
      opensSinceLastHighRarity: isHighRarity ? 0 : 1,
    },
  });

  return isHighRarity;
}

// ─── Rate Limiting (Redis sliding window) ──────────────

// ─── Crate Open (transactional) ─────────────────────────

export async function openCrate(
  walletAddress: string,
  crateDefinitionId: string,
  userId: string,
): Promise<CrateOpenResult> {
  const address = walletAddress.toLowerCase();

  // 1. Redis rate limit check (before intent creation)
  await checkRateLimit(
    `crate_open:${userId}`,
    RATE_LIMITS.CRATE_OPEN.max,
    RATE_LIMITS.CRATE_OPEN.windowSec,
  );

  // 2. Check pity system (read-only, before transaction)
  const pity = await checkPity(userId, crateDefinitionId);
  const pityTriggered = pity.forcedRarity !== null;

  // 3. Select reward BEFORE transaction (reads only, retry-safe)
  const reward = await selectReward(crateDefinitionId, pity.forcedRarity);

  // 4. Wrap in intent protection for idempotency
  return withIntent(userId, "CRATE_OPEN", crateDefinitionId, async () => {
    const result = await prisma.$transaction(async (tx) => {
      // 4a. Verify crate ownership + decrement
      const userCrate = await tx.userCrate.findUnique({
        where: {
          walletAddress_crateDefinitionId: {
            walletAddress: address,
            crateDefinitionId,
          },
        },
      });

      if (!userCrate || userCrate.quantity <= 0) {
        throw new CrateError("NOT_OWNED", "You do not own this crate");
      }

      let remainingCrates: number;
      if (userCrate.quantity === 1) {
        await tx.userCrate.delete({ where: { id: userCrate.id } });
        remainingCrates = 0;
      } else {
        const updated = await tx.userCrate.update({
          where: { id: userCrate.id },
          data: { quantity: { decrement: 1 } },
        });
        remainingCrates = updated.quantity;
      }

      // 4b. Distribute reward by type
      let rewardResult: CrateRewardResult;

      switch (reward.rewardType) {
        case "TRAIT": {
          rewardResult = await distributeTraitReward(tx, address, reward.traitDefinitionId!, reward.traitRarity);
          break;
        }
        case "PAWS": {
          rewardResult = await distributePawsReward(tx, userId, reward.pawsAmount!);
          break;
        }
        case "CUB": {
          rewardResult = await distributeCubReward(tx, userId, reward.cubRarity);
          break;
        }
        default:
          throw new CrateError("UNSUPPORTED_REWARD", `Unsupported reward type: ${reward.rewardType}`);
      }

      // 4c. Update pity tracking
      const effectiveRarity = rewardResult.rarity ?? null;
      await updatePityStats(tx, userId, crateDefinitionId, effectiveRarity);

      return { success: true as const, reward: rewardResult, remainingCrates };
    });

    // 5. Emit events (outside transaction, fire-and-forget)
    economyEvents.emit("crate_opened", {
      userId,
      data: {
        crateDefinitionId,
        rewardType: result.reward.rewardType,
        rarity: result.reward.rarity,
        remainingCrates: result.remainingCrates,
        pityTriggered,
        pityTier: pity.tier,
      },
    });

    if (pityTriggered) {
      economyEvents.emit("pity_triggered", {
        userId,
        data: { crateDefinitionId, forcedRarity: pity.forcedRarity, tier: pity.tier },
      });
    }

    // 6. Enqueue post-processing job (badge checks, analytics)
    crateQueue.add(`crate:${address}:${crateDefinitionId}`, {
      userId,
      walletAddress: address,
      crateDefinitionId,
      crateOpenId: `${Date.now()}`,
    }).catch((err) => {
      console.error("Failed to enqueue crate job (non-critical):", err);
    });

    return result;
  });
}

// ─── Reward Distribution ────────────────────────────────

async function distributeTraitReward(
  tx: Prisma.TransactionClient,
  walletAddress: string,
  traitDefinitionId: string,
  traitRarity: TraitRarity | null,
): Promise<CrateRewardResult> {
  // Atomic supply check: UPDATE WHERE currentSupply < maxSupply
  const updated = await tx.$executeRaw`
    UPDATE trait_definitions
    SET current_supply = current_supply + 1
    WHERE id = ${traitDefinitionId}
      AND current_supply < max_supply
  `;

  if (updated === 0) {
    throw new CrateError("TRAIT_SUPPLY_EXHAUSTED", "Trait supply exhausted between selection and distribution — please try again");
  }

  // Add trait to user inventory
  await tx.userTrait.upsert({
    where: {
      walletAddress_traitDefinitionId: {
        walletAddress,
        traitDefinitionId,
      },
    },
    update: { quantity: { increment: 1 } },
    create: {
      walletAddress,
      traitDefinitionId,
      quantity: 1,
      acquiredFrom: "CRATE",
    },
  });

  const traitDef = await tx.traitDefinition.findUniqueOrThrow({
    where: { id: traitDefinitionId },
  });

  return {
    rewardType: "TRAIT",
    traitDefinitionId,
    traitDefinition: serializeTraitDef(traitDef),
    rarity: traitRarity ?? traitDef.rarity,
  };
}

async function distributePawsReward(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
): Promise<CrateRewardResult> {
  await credit(userId, amount, "CRATE_REWARD", {
    note: `Crate reward: ${amount} PAWS`,
    tx,
  });

  return {
    rewardType: "PAWS",
    pawsAmount: amount,
  };
}

async function distributeCubReward(
  tx: Prisma.TransactionClient,
  userId: string,
  cubRarity: CubRarity | null,
): Promise<CrateRewardResult> {
  const maxToken = await tx.cub.aggregate({ _max: { tokenId: true } });
  const nextTokenId = (maxToken._max.tokenId ?? 0) + 1;

  const rarity = cubRarity ?? "COMMON";

  const newCub = await tx.cub.create({
    data: {
      tokenId: nextTokenId,
      name: `Cub #${nextTokenId}`,
      description: `A ${rarity.toLowerCase()} cub from a crate`,
      rarity,
      ownerId: userId,
    },
  });

  // Create staking position for the new cub
  const config = await tx.economyConfig.findUniqueOrThrow({ where: { id: 1 } });
  const multipliers = config.rarityMultipliers as Record<string, number>;
  const rateSnapshot = config.basePawsRate * (multipliers[rarity] ?? 1.0);

  await tx.stakingPosition.create({
    data: {
      cubId: newCub.id,
      userId,
      isActive: true,
      rateSnapshot,
      flatBonusSnapshot: 0,
      snapshotAt: new Date(),
    },
  });

  return {
    rewardType: "CUB",
    cubId: newCub.id,
    cubRarity: rarity,
  };
}

// ─── Error Class ───────────────────────────────────────

export class CrateError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CrateError";
  }
}

// ─── Helpers ────────────────────────────────────────────

function serializeTraitDef(def: {
  id: string;
  name: string;
  category: string;
  layer: number;
  rarity: string;
  rarityWeight: number;
  maxSupply: number;
  currentSupply: number;
  imageUrl: string;
  boostType: string;
  boostValue: number;
  isFullBody: boolean;
  isActive: boolean;
  createdAt: Date;
}): TraitDefinition {
  return {
    id: def.id,
    name: def.name,
    category: def.category as TraitDefinition["category"],
    layer: def.layer,
    rarity: def.rarity as TraitDefinition["rarity"],
    rarityWeight: def.rarityWeight,
    maxSupply: def.maxSupply,
    currentSupply: def.currentSupply,
    imageUrl: def.imageUrl,
    boostType: def.boostType as TraitDefinition["boostType"],
    boostValue: def.boostValue,
    isFullBody: def.isFullBody,
    isActive: def.isActive,
    createdAt: def.createdAt.toISOString(),
  };
}

/**
 * Validates that a CrateReward row has exactly one reference type set.
 * Ensures data integrity for polymorphic rewards.
 */
export function validateCrateRewardReferences(reward: {
  rewardType: string;
  traitDefinitionId: string | null;
  cubId: string | null;
  contractAddress: string | null;
  tokenId: string | null;
}): { valid: boolean; error?: string } {
  const refs = [
    reward.traitDefinitionId != null,
    reward.cubId != null,
    reward.contractAddress != null || reward.tokenId != null,
  ];
  const setCount = refs.filter(Boolean).length;

  switch (reward.rewardType) {
    case "TRAIT":
      if (!reward.traitDefinitionId) return { valid: false, error: "TRAIT reward must set traitDefinitionId" };
      if (setCount > 1) return { valid: false, error: "TRAIT reward must not set cubId or NFT fields" };
      break;
    case "CUB":
      if (reward.traitDefinitionId) return { valid: false, error: "CUB reward must not set traitDefinitionId" };
      break;
    case "NFT":
      if (!reward.contractAddress || !reward.tokenId) return { valid: false, error: "NFT reward must set contractAddress and tokenId" };
      if (reward.traitDefinitionId || reward.cubId) return { valid: false, error: "NFT reward must not set trait or cub fields" };
      break;
    case "PAWS":
      if (setCount > 0) return { valid: false, error: "PAWS reward must not set any reference fields" };
      break;
  }

  return { valid: true };
}

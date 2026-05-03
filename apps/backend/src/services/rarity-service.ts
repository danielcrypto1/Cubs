import { prisma } from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";
import type { RarityScoreResult, TraitCategory } from "@cubs/shared";

// ─── Rarity Calculation Service ───────────────────────
//
// Computes a deterministic rarity score for a cub based on
// its equipped trait composition. Score = Σ(rarityWeight)
// across all equipped slots. Higher score = rarer cub.
//
// Used by: forge preview, forge apply, leaderboard.
// ─────────────────────────────────────────────────────────

/** Base rarity weight per rarity tier (used when traitDef.rarityWeight is 0) */
const DEFAULT_RARITY_WEIGHTS: Record<string, number> = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 4,
  EPIC: 8,
  LEGENDARY: 16,
};

/** Bonus multiplier for filling more slots — rewards complete compositions */
const SLOT_COMPLETION_BONUS: Record<number, number> = {
  0: 0,
  1: 1.0,
  2: 1.0,
  3: 1.05,
  4: 1.1,
  5: 1.15,
  6: 1.2,
  7: 1.3,
  8: 1.4,
  9: 1.5, // all 9 slots filled
};

/**
 * Calculates rarity score from a set of trait definitions.
 * Pure function — no DB access, suitable for preview.
 */
export function calculateRarityScore(
  traits: Array<{ rarity: string; rarityWeight: number; category: string }>,
): number {
  if (traits.length === 0) return 0;

  let rawScore = 0;
  for (const trait of traits) {
    const weight = trait.rarityWeight > 0
      ? trait.rarityWeight
      : (DEFAULT_RARITY_WEIGHTS[trait.rarity] ?? 1);
    rawScore += weight;
  }

  const slotCount = traits.length;
  const completionMultiplier = SLOT_COMPLETION_BONUS[slotCount] ?? 1.0;

  return Math.round(rawScore * completionMultiplier * 100) / 100;
}

/**
 * Calculates rarity score for a cub from its currently equipped traits.
 * Reads from DB — use for apply mode and post-forge updates.
 */
export async function calculateCubRarityScore(
  cubId: string,
  client: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<number> {
  const equipped = await client.cubEquippedTrait.findMany({
    where: { cubId },
    include: { traitDefinition: true },
  });

  const traits = equipped.map((eq) => ({
    rarity: eq.traitDefinition.rarity,
    rarityWeight: eq.traitDefinition.rarityWeight,
    category: eq.traitDefinition.category,
  }));

  return calculateRarityScore(traits);
}

/**
 * Estimates leaderboard rank for a given rarity score.
 * Uses a count query — O(1) with the right index.
 */
export async function estimateRank(
  rarityScore: number,
  client: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<RarityScoreResult> {
  const [higherCount, totalCount] = await Promise.all([
    client.cub.count({ where: { rarityScore: { gt: rarityScore } } }),
    client.cub.count(),
  ]);

  return {
    score: rarityScore,
    rank: higherCount + 1,
    totalCubs: totalCount,
  };
}

/**
 * Recalculates and persists rarity score on the cub record.
 * Should be called after any forge apply or trait change.
 */
export async function updateCubRarityScore(
  cubId: string,
  client: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<number> {
  const score = await calculateCubRarityScore(cubId, client);

  await client.cub.update({
    where: { id: cubId },
    data: { rarityScore: score },
  });

  return score;
}

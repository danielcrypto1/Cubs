// ─── Rarity Engine ───────────────────────────────────────────────────────────
// Calculates rarity scores based on trait weights from the trait registry.
// Rarity of a trait = 1 / (trait_weight / category_total_weight)
//   i.e. category_total_weight / trait_weight
// Lower weight traits are rarer and produce higher scores.

import {
  type CubType,
  type TraitCategory,
  getTraitCategories,
  getTraitByName,
} from "./trait-registry";

// ─── Core scoring ────────────────────────────────────────────────────────────

/**
 * Calculate the rarity score for a single trait.
 * Score = totalWeight / traitWeight (higher = rarer).
 * Returns 0 if the trait is not found.
 */
export function traitRarityScore(
  category: string,
  traitName: string,
  isOnsie?: boolean,
): number {
  const cats = isOnsie
    ? getTraitCategories("onsie")
    : getTraitCategories("regular");

  const cat = cats.find((c) => c.name === category);
  if (!cat) return 0;

  const trait = cat.traits.find((t) => t.name === traitName);
  if (!trait) return 0;

  return cat.totalWeight / trait.weight;
}

/**
 * Calculate the total rarity score for a full cub (sum of all trait rarity scores).
 */
export function cubRarityScore(
  attributes: { trait_type: string; value: string }[],
  cubType: CubType,
): number {
  if (cubType === "oneofone") return Infinity;

  const isOnsie = cubType === "onsie";
  return attributes.reduce((total, attr) => {
    return total + traitRarityScore(attr.trait_type, attr.value, isOnsie);
  }, 0);
}

// ─── Min / Max score helpers ─────────────────────────────────────────────────

function categoryMinMaxScores(categories: TraitCategory[]): {
  min: number;
  max: number;
} {
  let min = 0;
  let max = 0;

  for (const cat of categories) {
    if (cat.traits.length === 0) continue;

    // Most common trait in category → lowest rarity score
    const maxWeight = Math.max(...cat.traits.map((t) => t.weight));
    min += cat.totalWeight / maxWeight;

    // Rarest trait in category → highest rarity score
    const minWeight = Math.min(...cat.traits.map((t) => t.weight));
    max += cat.totalWeight / minWeight;
  }

  return { min, max };
}

/**
 * Calculate rarity percentage (0-100) normalised between the min and max
 * possible scores for the given cub type. 100 = rarest possible.
 */
export function cubRarityPercentage(
  attributes: { trait_type: string; value: string }[],
  cubType: CubType,
): number {
  if (cubType === "oneofone") return 100;

  const categories = getTraitCategories(cubType);
  const { min, max } = categoryMinMaxScores(categories);

  if (max === min) return 50; // all traits equally weighted (degenerate case)

  const score = cubRarityScore(attributes, cubType);
  const pct = ((score - min) / (max - min)) * 100;

  // Clamp to [0, 100] (score could land slightly outside if attributes are incomplete)
  return Math.max(0, Math.min(100, pct));
}

// ─── Rarity tier ─────────────────────────────────────────────────────────────

export interface RarityTier {
  label: string;
  color: string;
}

/**
 * Map a rarity percentage to a human-readable tier with associated colour.
 */
export function rarityTier(percentage: number): RarityTier {
  if (percentage >= 99) return { label: "Mythic", color: "#ff44ff" };
  if (percentage >= 90) return { label: "Legendary", color: "#ffa500" };
  if (percentage >= 75) return { label: "Epic", color: "#a855f7" };
  if (percentage >= 50) return { label: "Rare", color: "#3b82f6" };
  if (percentage >= 25) return { label: "Uncommon", color: "#22c55e" };
  return { label: "Common", color: "#9ca3af" };
}

// ─── Delta comparison ────────────────────────────────────────────────────────

/**
 * Compare current vs proposed trait sets and return the rarity change.
 */
export function rarityDelta(
  currentAttributes: { trait_type: string; value: string }[],
  proposedAttributes: { trait_type: string; value: string }[],
  cubType: CubType,
): { current: number; proposed: number; delta: number } {
  const current = cubRarityPercentage(currentAttributes, cubType);
  const proposed = cubRarityPercentage(proposedAttributes, cubType);
  return {
    current,
    proposed,
    delta: proposed - current,
  };
}

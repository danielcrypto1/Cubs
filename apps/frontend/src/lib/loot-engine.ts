import { MOCK_TRAIT_DEFINITIONS } from "@/lib/mock-data";
import type { TraitDefinition, TraitRarity } from "@/types";

interface DropRate {
  rarity: string;
  chance: number;
}

interface LootResult {
  traitDefinition: TraitDefinition;
  rarity: TraitRarity;
}

const RARITY_FALLBACK_ORDER: TraitRarity[] = [
  "LEGENDARY",
  "EPIC",
  "RARE",
  "UNCOMMON",
  "COMMON",
];

function normalizeRarity(rarity: string): TraitRarity {
  const upper = rarity.toUpperCase();
  if (RARITY_FALLBACK_ORDER.includes(upper as TraitRarity)) {
    return upper as TraitRarity;
  }
  return "COMMON";
}

function getTraitsForRarity(rarity: TraitRarity): TraitDefinition[] {
  return MOCK_TRAIT_DEFINITIONS.filter(
    (t) => t.rarity === rarity && t.currentSupply < t.maxSupply,
  );
}

export function rollCrate(dropRates: DropRate[]): LootResult {
  // Roll random number and walk cumulative probabilities
  const roll = Math.random() * 100;
  let cumulative = 0;
  let selectedRarity: TraitRarity = "COMMON";

  for (const rate of dropRates) {
    cumulative += rate.chance;
    if (roll <= cumulative) {
      selectedRarity = normalizeRarity(rate.rarity);
      break;
    }
  }

  // Try to find available traits at the selected rarity
  let pool = getTraitsForRarity(selectedRarity);

  // If no traits available, fall back through rarity tiers
  if (pool.length === 0) {
    const startIdx = RARITY_FALLBACK_ORDER.indexOf(selectedRarity);
    for (let i = startIdx + 1; i < RARITY_FALLBACK_ORDER.length; i++) {
      pool = getTraitsForRarity(RARITY_FALLBACK_ORDER[i]);
      if (pool.length > 0) {
        selectedRarity = RARITY_FALLBACK_ORDER[i];
        break;
      }
    }
  }

  // Pick a random trait from the pool (should always have at least one)
  const trait = pool[Math.floor(Math.random() * pool.length)];

  return {
    traitDefinition: trait,
    rarity: selectedRarity,
  };
}

import { prisma } from "../lib/prisma.js";
import type { TraitRarity } from "@prisma/client";

interface LootResult {
  traitDefinitionId: string;
  traitName: string;
  traitRarity: TraitRarity;
  traitImageUrl: string;
  traitCategory: string;
}

async function selectRarityTier(crateDefinitionId: string): Promise<TraitRarity> {
  const entries = await prisma.lootTableEntry.findMany({
    where: { crateDefinitionId, traitRarity: { not: null } },
    orderBy: { probability: "desc" },
  });

  if (entries.length === 0) {
    throw new Error("No loot table configured for this crate");
  }

  const totalWeight = entries.reduce((sum, e) => sum + e.probability, 0);
  const roll = Math.random() * totalWeight;
  let cumulative = 0;

  for (const entry of entries) {
    cumulative += entry.probability;
    if (roll <= cumulative) {
      return entry.traitRarity!;
    }
  }

  return entries[entries.length - 1].traitRarity!;
}

export async function selectReward(crateDefinitionId: string, maxRetries = 3): Promise<LootResult> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const selectedRarity = await selectRarityTier(crateDefinitionId);

    // Fetch traits at this rarity and filter for available supply
    const traits = await prisma.traitDefinition.findMany({
      where: { rarity: selectedRarity },
    });
    const mintable = traits.filter((t) => t.currentSupply < t.maxSupply);

    if (mintable.length === 0) {
      // No traits available at this rarity, retry with a new roll
      continue;
    }

    const selected = mintable[Math.floor(Math.random() * mintable.length)];

    return {
      traitDefinitionId: selected.id,
      traitName: selected.name,
      traitRarity: selected.rarity,
      traitImageUrl: selected.imageUrl,
      traitCategory: selected.category,
    };
  }

  throw new Error("No available traits after multiple attempts — all supply may be exhausted");
}

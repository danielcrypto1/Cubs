import { prisma } from "../lib/prisma.js";
import type { TraitCategory, TraitRarity } from "@prisma/client";

export async function findAllTraitDefinitions(filters?: {
  category?: TraitCategory;
  rarity?: TraitRarity;
}) {
  return prisma.traitDefinition.findMany({
    where: {
      ...(filters?.category && { category: filters.category }),
      ...(filters?.rarity && { rarity: filters.rarity }),
    },
    orderBy: [{ category: "asc" }, { rarity: "asc" }, { name: "asc" }],
  });
}

export async function findTraitDefinitionById(id: string) {
  return prisma.traitDefinition.findUnique({ where: { id } });
}

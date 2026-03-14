import { prisma } from "../lib/prisma.js";

export async function findTraitsByCubId(cubId: string) {
  return prisma.trait.findMany({
    where: { cubId },
    orderBy: { displayOrder: "asc" },
  });
}

export async function getDistinctTraitTypes() {
  const traits = await prisma.trait.findMany({
    select: { traitType: true, traitValue: true },
    distinct: ["traitType", "traitValue"],
    orderBy: [{ traitType: "asc" }, { traitValue: "asc" }],
  });

  const grouped: Record<string, string[]> = {};
  for (const trait of traits) {
    if (!grouped[trait.traitType]) grouped[trait.traitType] = [];
    grouped[trait.traitType].push(trait.traitValue);
  }
  return grouped;
}

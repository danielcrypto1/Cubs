import { prisma } from "../lib/prisma.js";

export async function findTraitsByCubId(cubId: string) {
  return prisma.cubEquippedTrait.findMany({
    where: { cubId },
    include: { traitDefinition: true },
    orderBy: { slotCategory: "asc" },
  });
}

export async function getDistinctTraitTypes() {
  const equipped = await prisma.cubEquippedTrait.findMany({
    include: { traitDefinition: { select: { category: true, name: true } } },
    distinct: ["slotCategory", "traitDefinitionId"],
  });

  const grouped: Record<string, string[]> = {};
  for (const eq of equipped) {
    const cat = eq.traitDefinition.category;
    if (!grouped[cat]) grouped[cat] = [];
    const name = eq.traitDefinition.name;
    if (!grouped[cat].includes(name)) {
      grouped[cat].push(name);
    }
  }

  // Sort values within each category
  for (const cat of Object.keys(grouped)) {
    grouped[cat].sort();
  }

  return grouped;
}

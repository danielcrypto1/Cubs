import { prisma } from "../lib/prisma.js";

const CUB_INCLUDE = {
  equippedTraits: { include: { traitDefinition: true }, orderBy: { slotCategory: "asc" as const } },
  owner: { select: { walletAddress: true, displayName: true } },
} as const;

export async function findAllCubs(options: {
  owner?: string;
  page?: number;
  limit?: number;
}) {
  const { owner, page = 1, limit = 20 } = options;

  const where = owner
    ? { owner: { walletAddress: owner.toLowerCase() } }
    : {};

  const [cubs, total] = await Promise.all([
    prisma.cub.findMany({
      where,
      include: CUB_INCLUDE,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { tokenId: "asc" },
    }),
    prisma.cub.count({ where }),
  ]);

  return { cubs, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function findCubById(id: string) {
  return prisma.cub.findUnique({
    where: { id },
    include: CUB_INCLUDE,
  });
}

export async function createCub(data: {
  tokenId: number;
  name?: string;
  description?: string;
  imageUrl?: string;
  metadataUri?: string;
  ownerId: string;
}) {
  return prisma.cub.create({
    data,
    include: {
      equippedTraits: { include: { traitDefinition: true } },
    },
  });
}

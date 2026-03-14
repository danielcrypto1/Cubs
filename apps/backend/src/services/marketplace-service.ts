import { prisma } from "../lib/prisma.js";

export async function findActiveListings(options: {
  page?: number;
  limit?: number;
}) {
  const { page = 1, limit = 20 } = options;

  const [listings, total] = await Promise.all([
    prisma.marketplaceListing.findMany({
      where: { status: "ACTIVE" },
      include: {
        cub: { include: { traits: true } },
        seller: { select: { walletAddress: true, displayName: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { listedAt: "desc" },
    }),
    prisma.marketplaceListing.count({ where: { status: "ACTIVE" } }),
  ]);

  return { listings, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createListing(data: {
  cubId: string;
  sellerId: string;
  priceWei: string;
}) {
  return prisma.marketplaceListing.create({ data });
}

export async function completePurchase(listingId: string, buyerId: string, txHash: string) {
  return prisma.marketplaceListing.update({
    where: { id: listingId },
    data: {
      buyerId,
      txHash,
      status: "SOLD",
      soldAt: new Date(),
    },
  });
}

import { prisma } from "../lib/prisma.js";
import { getOrSetCached, invalidateMarketplaceCache, buildCacheKey } from "./marketplace-cache.js";
import type { AssetType, Prisma } from "@prisma/client";

interface ListingFilters {
  assetType?: AssetType;
  rarity?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

const LISTING_INCLUDES = {
  cub: { include: { traits: true } },
  traitDefinition: true,
  crateDefinition: true,
  seller: { select: { walletAddress: true, displayName: true } },
} as const;

export async function findActiveListings(filters: ListingFilters) {
  const { page = 1, limit = 20, assetType, rarity, minPrice, maxPrice, sortBy } = filters;

  const cacheKey = buildCacheKey("listings", filters as unknown as Record<string, unknown>);

  return getOrSetCached(cacheKey, 30, async () => {
    const where: Prisma.MarketplaceListingWhereInput = { status: "ACTIVE" };

    if (assetType) {
      where.assetType = assetType;
    }

    if (rarity) {
      where.OR = [
        { cub: { traits: { some: {} } } },
        { traitDefinition: { rarity: rarity as Prisma.EnumTraitRarityFilter["equals"] } },
        { crateDefinition: { rarity: rarity as Prisma.EnumTraitRarityFilter["equals"] } },
      ];
      // When filtering by rarity with a specific asset type, narrow the OR
      if (assetType === "TRAIT") {
        where.OR = undefined;
        where.traitDefinition = { rarity: rarity as Prisma.EnumTraitRarityFilter["equals"] };
      } else if (assetType === "CRATE") {
        where.OR = undefined;
        where.crateDefinition = { rarity: rarity as Prisma.EnumTraitRarityFilter["equals"] };
      }
    }

    if (minPrice || maxPrice) {
      // priceWei is a string; for proper comparison we'd need BigInt.
      // For now, filter in application layer after fetching.
    }

    let orderBy: Prisma.MarketplaceListingOrderByWithRelationInput;
    switch (sortBy) {
      case "price_asc":
        orderBy = { priceWei: "asc" };
        break;
      case "price_desc":
        orderBy = { priceWei: "desc" };
        break;
      case "oldest":
        orderBy = { listedAt: "asc" };
        break;
      default:
        orderBy = { listedAt: "desc" };
    }

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        include: LISTING_INCLUDES,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.marketplaceListing.count({ where }),
    ]);

    return { listings, total, page, limit, pages: Math.ceil(total / limit) };
  });
}

export async function findListingById(id: string) {
  const cacheKey = `listing:${id}`;

  return getOrSetCached(cacheKey, 60, async () => {
    return prisma.marketplaceListing.findUnique({
      where: { id },
      include: LISTING_INCLUDES,
    });
  });
}

export async function createListing(data: {
  assetType: AssetType;
  assetId: string;
  quantity: number;
  priceWei: string;
  sellerId: string;
  sellerWallet: string;
}) {
  const { assetType, assetId, quantity, priceWei, sellerId, sellerWallet } = data;

  // Validate ownership and build listing data
  const listingData: Prisma.MarketplaceListingCreateInput = {
    assetType,
    quantity,
    priceWei,
    seller: { connect: { id: sellerId } },
  };

  switch (assetType) {
    case "CUB": {
      const cub = await prisma.cub.findUnique({ where: { id: assetId } });
      if (!cub || cub.ownerId !== sellerId) {
        throw new Error("You do not own this Cub");
      }
      // Check no active listing exists for this cub
      const existingListing = await prisma.marketplaceListing.findFirst({
        where: { cubId: assetId, status: "ACTIVE" },
      });
      if (existingListing) {
        throw new Error("This Cub is already listed");
      }
      listingData.cub = { connect: { id: assetId } };
      listingData.quantity = 1; // Cubs are always quantity 1
      break;
    }
    case "TRAIT": {
      const userTrait = await prisma.userTrait.findUnique({
        where: {
          walletAddress_traitDefinitionId: {
            walletAddress: sellerWallet,
            traitDefinitionId: assetId,
          },
        },
      });
      if (!userTrait || userTrait.quantity < 1) {
        throw new Error("You do not own this Trait");
      }
      // Check available quantity (owned minus actively listed)
      const activeListedQty = await prisma.marketplaceListing.aggregate({
        where: {
          traitDefinitionId: assetId,
          sellerId,
          status: "ACTIVE",
        },
        _sum: { quantity: true },
      });
      const available = userTrait.quantity - (activeListedQty._sum.quantity ?? 0);
      if (available < quantity) {
        throw new Error(`Insufficient quantity. Available: ${available}`);
      }
      listingData.traitDefinition = { connect: { id: assetId } };
      break;
    }
    case "CRATE": {
      const userCrate = await prisma.userCrate.findUnique({
        where: {
          walletAddress_crateDefinitionId: {
            walletAddress: sellerWallet,
            crateDefinitionId: assetId,
          },
        },
      });
      if (!userCrate || userCrate.quantity < 1) {
        throw new Error("You do not own this Crate");
      }
      // Check available quantity
      const activeListedQty = await prisma.marketplaceListing.aggregate({
        where: {
          crateDefinitionId: assetId,
          sellerId,
          status: "ACTIVE",
        },
        _sum: { quantity: true },
      });
      const available = userCrate.quantity - (activeListedQty._sum.quantity ?? 0);
      if (available < quantity) {
        throw new Error(`Insufficient quantity. Available: ${available}`);
      }
      listingData.crateDefinition = { connect: { id: assetId } };
      break;
    }
  }

  const listing = await prisma.marketplaceListing.create({
    data: listingData,
    include: LISTING_INCLUDES,
  });

  await invalidateMarketplaceCache();
  return listing;
}

export async function completePurchase(listingId: string, buyerId: string, buyerWallet: string) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.marketplaceListing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) throw new Error("Listing not found");
    if (listing.status !== "ACTIVE") throw new Error("Listing is no longer active");
    if (listing.sellerId === buyerId) throw new Error("Cannot buy your own listing");

    // Transfer ownership based on asset type
    switch (listing.assetType) {
      case "CUB": {
        await tx.cub.update({
          where: { id: listing.cubId! },
          data: { ownerId: buyerId },
        });
        break;
      }
      case "TRAIT": {
        // Decrement seller's trait quantity
        const sellerTrait = await tx.userTrait.findUnique({
          where: {
            walletAddress_traitDefinitionId: {
              walletAddress: listing.seller.walletAddress,
              traitDefinitionId: listing.traitDefinitionId!,
            },
          },
        });
        if (!sellerTrait || sellerTrait.quantity < listing.quantity) {
          throw new Error("Seller no longer has sufficient trait quantity");
        }
        if (sellerTrait.quantity === listing.quantity) {
          await tx.userTrait.delete({ where: { id: sellerTrait.id } });
        } else {
          await tx.userTrait.update({
            where: { id: sellerTrait.id },
            data: { quantity: { decrement: listing.quantity } },
          });
        }
        // Upsert buyer's trait
        await tx.userTrait.upsert({
          where: {
            walletAddress_traitDefinitionId: {
              walletAddress: buyerWallet,
              traitDefinitionId: listing.traitDefinitionId!,
            },
          },
          update: { quantity: { increment: listing.quantity } },
          create: {
            walletAddress: buyerWallet,
            traitDefinitionId: listing.traitDefinitionId!,
            quantity: listing.quantity,
            acquiredFrom: "MARKETPLACE",
          },
        });
        break;
      }
      case "CRATE": {
        // Decrement seller's crate quantity
        const sellerCrate = await tx.userCrate.findUnique({
          where: {
            walletAddress_crateDefinitionId: {
              walletAddress: listing.seller.walletAddress,
              crateDefinitionId: listing.crateDefinitionId!,
            },
          },
        });
        if (!sellerCrate || sellerCrate.quantity < listing.quantity) {
          throw new Error("Seller no longer has sufficient crate quantity");
        }
        if (sellerCrate.quantity === listing.quantity) {
          await tx.userCrate.delete({ where: { id: sellerCrate.id } });
        } else {
          await tx.userCrate.update({
            where: { id: sellerCrate.id },
            data: { quantity: { decrement: listing.quantity } },
          });
        }
        // Upsert buyer's crate
        await tx.userCrate.upsert({
          where: {
            walletAddress_crateDefinitionId: {
              walletAddress: buyerWallet,
              crateDefinitionId: listing.crateDefinitionId!,
            },
          },
          update: { quantity: { increment: listing.quantity } },
          create: {
            walletAddress: buyerWallet,
            crateDefinitionId: listing.crateDefinitionId!,
            quantity: listing.quantity,
          },
        });
        break;
      }
    }

    // Update listing status
    const updatedListing = await tx.marketplaceListing.update({
      where: { id: listingId },
      data: {
        buyerId,
        status: "SOLD",
        soldAt: new Date(),
      },
      include: LISTING_INCLUDES,
    });

    // Calculate fees (stored for future on-chain integration)
    const priceBigInt = BigInt(listing.priceWei);
    const platformFee = (priceBigInt * 250n) / 10000n; // 2.5%
    const royaltyFee = (priceBigInt * 500n) / 10000n; // 5%

    const sale = await tx.marketplaceSale.create({
      data: {
        listingId,
        sellerId: listing.sellerId,
        buyerId,
        priceWei: listing.priceWei,
        platformFeeWei: platformFee.toString(),
        royaltyFeeWei: royaltyFee.toString(),
      },
    });

    await invalidateMarketplaceCache();
    return { listing: updatedListing, sale };
  });
}

export async function cancelListing(listingId: string, sellerId: string) {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: listingId },
  });

  if (!listing) throw new Error("Listing not found");
  if (listing.sellerId !== sellerId) throw new Error("Not your listing");
  if (listing.status !== "ACTIVE") throw new Error("Listing is not active");

  const updated = await prisma.marketplaceListing.update({
    where: { id: listingId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
    include: LISTING_INCLUDES,
  });

  await invalidateMarketplaceCache();
  return updated;
}

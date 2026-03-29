import { prisma } from "../lib/prisma.js";
import { economyEvents } from "../lib/economy-events.js";
import { getOrSetCached, invalidateMarketplaceCache, buildCacheKey } from "./marketplace-cache.js";
import { pauseStaking, transferStaking } from "./staking-service.js";
import { withIntent } from "./transaction-intent-service.js";
import { credit, debit } from "./paws-service.js";
import type { AssetType, PriceType, Prisma } from "@prisma/client";

interface ListingFilters {
  assetType?: AssetType;
  rarity?: string;
  priceType?: PriceType;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

const LISTING_INCLUDES = {
  cub: { include: { equippedTraits: { include: { traitDefinition: true } } } },
  traitDefinition: true,
  crateDefinition: true,
  seller: { select: { walletAddress: true, displayName: true } },
} as const;

export async function findActiveListings(filters: ListingFilters) {
  const { page = 1, limit = 20, assetType, rarity, priceType, sortBy } = filters;

  const cacheKey = buildCacheKey("listings", filters as unknown as Record<string, unknown>);

  return getOrSetCached(cacheKey, 30, async () => {
    const where: Prisma.MarketplaceListingWhereInput = { status: "ACTIVE" };

    if (assetType) {
      where.assetType = assetType;
    }

    if (priceType) {
      where.priceType = priceType;
    }

    if (rarity) {
      where.OR = [
        { cub: { rarity: rarity as Prisma.EnumCubRarityFilter["equals"] } },
        { traitDefinition: { rarity: rarity as Prisma.EnumTraitRarityFilter["equals"] } },
        { crateDefinition: { rarity: rarity as Prisma.EnumTraitRarityFilter["equals"] } },
      ];
      if (assetType === "CUB") {
        where.OR = undefined;
        where.cub = { rarity: rarity as Prisma.EnumCubRarityFilter["equals"] };
      } else if (assetType === "TRAIT") {
        where.OR = undefined;
        where.traitDefinition = { rarity: rarity as Prisma.EnumTraitRarityFilter["equals"] };
      } else if (assetType === "CRATE") {
        where.OR = undefined;
        where.crateDefinition = { rarity: rarity as Prisma.EnumTraitRarityFilter["equals"] };
      }
    }

    let orderBy: Prisma.MarketplaceListingOrderByWithRelationInput;
    switch (sortBy) {
      case "price_asc":
        orderBy = { priceAmount: "asc" };
        break;
      case "price_desc":
        orderBy = { priceAmount: "desc" };
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
  priceType: PriceType;
  priceAmount: string;
  sellerId: string;
  sellerWallet: string;
}) {
  const { assetType, assetId, quantity, priceType, priceAmount, sellerId, sellerWallet } = data;

  const listingData: Prisma.MarketplaceListingCreateInput = {
    assetType,
    quantity,
    priceType,
    priceAmount,
    seller: { connect: { id: sellerId } },
  };

  switch (assetType) {
    case "CUB": {
      const cub = await prisma.cub.findUnique({ where: { id: assetId } });
      if (!cub || cub.ownerId !== sellerId) {
        throw new Error("You do not own this Cub");
      }
      const existingListing = await prisma.marketplaceListing.findFirst({
        where: { cubId: assetId, status: "ACTIVE" },
      });
      if (existingListing) {
        throw new Error("This Cub is already listed");
      }
      listingData.cub = { connect: { id: assetId } };
      listingData.quantity = 1;
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

  // Pause staking when a CUB is listed (auto-claims accrued PAWS first)
  if (assetType === "CUB") {
    await pauseStaking(assetId);
  }

  await invalidateMarketplaceCache();

  economyEvents.emit("listing_created", {
    userId: sellerId,
    data: { listingId: listing.id, assetType, priceType, priceAmount },
  });

  return listing;
}

// ─── Advisory Lock ──────────────────────────────────────

function userLockId(userId: string): bigint {
  let h = 0xcbf29ce484222325n;
  for (let i = 0; i < userId.length; i++) {
    h ^= BigInt(userId.charCodeAt(i));
    h = (h * 0x100000001b3n) & 0x7fffffffffffffffn;
  }
  return h;
}

async function acquireLock(tx: Prisma.TransactionClient, userId: string): Promise<void> {
  const lockId = userLockId(userId);
  await tx.$queryRawUnsafe(`SELECT pg_advisory_xact_lock(${lockId})`);
}

export async function completePurchase(listingId: string, buyerId: string, buyerWallet: string) {
  return withIntent(buyerId, "MARKETPLACE_BUY", listingId, async () => {
    const result = await prisma.$transaction(async (tx) => {
      const listing = await tx.marketplaceListing.findUnique({
        where: { id: listingId },
        include: { seller: true },
      });

      if (!listing) throw new Error("Listing not found");
      if (listing.status !== "ACTIVE") throw new Error("Listing is no longer active");
      if (listing.sellerId === buyerId) throw new Error("Cannot buy your own listing");

      // Advisory lock both buyer and seller to prevent race conditions
      await acquireLock(tx, buyerId);
      await acquireLock(tx, listing.sellerId);

      // Process PAWS payment if applicable
      let pawsBurned = 0;
      if (listing.priceType === "PAWS") {
        const priceNum = parseInt(listing.priceAmount, 10);
        const config = await tx.economyConfig.findFirst({ where: { id: 1 } });
        const burnPct = config?.pawsTradeBurnPct ?? 10;
        pawsBurned = Math.floor(priceNum * burnPct / 100);
        const sellerReceives = priceNum - pawsBurned;

        // Debit full amount from buyer
        await debit(buyerId, priceNum, "MARKETPLACE_BUY", {
          referenceId: listingId,
          note: `Buy listing: ${listing.assetType}`,
          tx,
        });

        // Credit seller (minus burn)
        if (sellerReceives > 0) {
          await credit(listing.sellerId, sellerReceives, "MARKETPLACE_SELL", {
            referenceId: listingId,
            note: `Listing sold: ${listing.assetType}`,
            tx,
          });
        }
      }

      // Transfer ownership based on asset type
      switch (listing.assetType) {
        case "CUB": {
          await tx.cub.update({
            where: { id: listing.cubId! },
            data: { ownerId: buyerId },
          });
          await transferStaking(listing.cubId!, buyerId, tx);
          break;
        }
        case "TRAIT": {
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

      // Cancel all active offers on this listing
      await tx.marketplaceOffer.updateMany({
        where: { listingId, status: "ACTIVE" },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });

      // Calculate fees for sale record
      const priceNum = parseInt(listing.priceAmount, 10);
      const platformFee = listing.priceType === "PAWS" ? 0 : Math.floor(priceNum * 250 / 10000); // 0% for PAWS, 2.5% for ETH
      const royaltyFee = listing.priceType === "ETH" ? Math.floor(priceNum * 500 / 10000) : 0; // 5% royalty for ETH only

      const sale = await tx.marketplaceSale.create({
        data: {
          listingId,
          sellerId: listing.sellerId,
          buyerId,
          priceType: listing.priceType,
          priceAmount: listing.priceAmount,
          platformFee: platformFee.toString(),
          royaltyFee: royaltyFee.toString(),
          pawsBurned: pawsBurned.toString(),
        },
      });

      await invalidateMarketplaceCache();
      return { listing: updatedListing, sale };
    });

    // Emit event outside transaction
    economyEvents.emit("marketplace_sold", {
      userId: buyerId,
      data: { listingId, saleId: result.sale.id, priceAmount: result.listing.priceAmount },
    });

    return result;
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

import { prisma } from "../lib/prisma.js";
import { economyEvents } from "../lib/economy-events.js";
import { withIntent } from "./transaction-intent-service.js";
import { credit, debit } from "./paws-service.js";
import { transferStaking } from "./staking-service.js";
import { invalidateMarketplaceCache } from "./marketplace-cache.js";
import type { AssetType, PriceType, Prisma } from "@prisma/client";

// ─── Advisory Lock (same FNV-1a pattern as paws-service) ─

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

// ─── Get economy config ──────────────────────────────────

async function getEconomyConfig(tx: Prisma.TransactionClient) {
  return tx.economyConfig.findFirst({ where: { id: 1 } });
}

// ─── Offer Includes ──────────────────────────────────────

const OFFER_INCLUDES = {
  buyer: { select: { walletAddress: true, displayName: true } },
} as const;

// ─── Create Offer ────────────────────────────────────────

export async function createOffer(data: {
  listingId?: string;
  assetType: AssetType;
  assetId: string;
  quantity: number;
  buyerId: string;
  priceType: PriceType;
  priceAmount: string;
  expiresAt?: string;
}) {
  const { listingId, assetType, assetId, quantity, buyerId, priceType, priceAmount, expiresAt } = data;

  // Validate buyer has sufficient PAWS (do NOT debit yet)
  if (priceType === "PAWS") {
    const balance = await prisma.pawsTransaction.aggregate({
      where: { userId: buyerId },
      _sum: { amount: true },
    });
    const currentBalance = balance._sum.amount ?? 0;
    if (currentBalance < parseInt(priceAmount, 10)) {
      throw new Error("Insufficient PAWS balance to make this offer");
    }
  }

  // If targeting a listing, validate it exists and is active
  if (listingId) {
    const listing = await prisma.marketplaceListing.findUnique({ where: { id: listingId } });
    if (!listing || listing.status !== "ACTIVE") {
      throw new Error("Listing not found or no longer active");
    }
    if (listing.sellerId === buyerId) {
      throw new Error("Cannot make an offer on your own listing");
    }
  }

  const offerData: Prisma.MarketplaceOfferCreateInput = {
    listingId,
    assetType,
    quantity,
    priceType,
    priceAmount,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    buyer: { connect: { id: buyerId } },
  };

  switch (assetType) {
    case "CUB":
      offerData.cubId = assetId;
      offerData.quantity = 1;
      break;
    case "TRAIT":
      offerData.traitDefinitionId = assetId;
      break;
    case "CRATE":
      offerData.crateDefinitionId = assetId;
      break;
  }

  const offer = await prisma.marketplaceOffer.create({
    data: offerData,
    include: OFFER_INCLUDES,
  });

  economyEvents.emit("offer_created", {
    userId: buyerId,
    data: { offerId: offer.id, assetType, assetId, priceAmount, priceType },
  });

  return offer;
}

// ─── Accept Offer ────────────────────────────────────────

export async function acceptOffer(offerId: string, sellerId: string, sellerWallet: string) {
  return withIntent(sellerId, "MARKETPLACE_OFFER_ACCEPT", offerId, async () => {
    return prisma.$transaction(async (tx) => {
      const offer = await tx.marketplaceOffer.findUnique({
        where: { id: offerId },
        include: { buyer: true },
      });

      if (!offer) throw new Error("Offer not found");
      if (offer.status !== "ACTIVE") throw new Error("Offer is no longer active");
      if (offer.buyerId === sellerId) throw new Error("Cannot accept your own offer");

      // Check expiry
      if (offer.expiresAt && new Date() > offer.expiresAt) {
        await tx.marketplaceOffer.update({
          where: { id: offerId },
          data: { status: "EXPIRED" },
        });
        throw new Error("Offer has expired");
      }

      // Lock both parties
      await acquireLock(tx, sellerId);
      await acquireLock(tx, offer.buyerId);

      // Validate seller ownership
      await validateOwnership(tx, offer.assetType, getAssetId(offer), sellerId, sellerWallet, offer.quantity);

      // Process PAWS payment
      const priceNum = parseInt(offer.priceAmount, 10);
      let pawsBurned = 0;

      if (offer.priceType === "PAWS") {
        const config = await getEconomyConfig(tx);
        const burnPct = config?.pawsTradeBurnPct ?? 10;
        pawsBurned = Math.floor(priceNum * burnPct / 100);
        const sellerReceives = priceNum - pawsBurned;

        // Debit buyer
        await debit(offer.buyerId, priceNum, "MARKETPLACE_BUY", {
          referenceId: offerId,
          note: `Offer accepted: ${offer.assetType}`,
          tx,
        });

        // Credit seller (minus burn)
        if (sellerReceives > 0) {
          await credit(sellerId, sellerReceives, "MARKETPLACE_SELL", {
            referenceId: offerId,
            note: `Offer sale: ${offer.assetType}`,
            tx,
          });
        }
      }

      // Transfer asset
      await transferAsset(tx, offer.assetType, getAssetId(offer), offer.quantity, sellerId, sellerWallet, offer.buyerId, offer.buyer.walletAddress);

      // Mark offer as accepted
      const updated = await tx.marketplaceOffer.update({
        where: { id: offerId },
        data: { status: "ACCEPTED", acceptedAt: new Date() },
        include: OFFER_INCLUDES,
      });

      // Create sale record
      await tx.marketplaceSale.create({
        data: {
          listingId: offer.listingId ?? offerId,
          sellerId,
          buyerId: offer.buyerId,
          priceType: offer.priceType,
          priceAmount: offer.priceAmount,
          platformFee: "0",
          royaltyFee: "0",
          pawsBurned: pawsBurned.toString(),
        },
      });

      // If this was on a listing, cancel that listing
      if (offer.listingId) {
        await tx.marketplaceListing.update({
          where: { id: offer.listingId },
          data: { status: "SOLD", buyerId: offer.buyerId, soldAt: new Date() },
        });
        // Cancel all other active offers on the same listing
        await tx.marketplaceOffer.updateMany({
          where: { listingId: offer.listingId, status: "ACTIVE", id: { not: offerId } },
          data: { status: "CANCELLED", cancelledAt: new Date() },
        });
      }

      await invalidateMarketplaceCache();

      economyEvents.emit("offer_accepted", {
        userId: sellerId,
        data: { offerId, buyerId: offer.buyerId, priceAmount: offer.priceAmount, pawsBurned },
      });

      return updated;
    });
  });
}

// ─── Cancel Offer ────────────────────────────────────────

export async function cancelOffer(offerId: string, buyerId: string) {
  const offer = await prisma.marketplaceOffer.findUnique({ where: { id: offerId } });
  if (!offer) throw new Error("Offer not found");
  if (offer.buyerId !== buyerId) throw new Error("Not your offer");
  if (offer.status !== "ACTIVE") throw new Error("Offer is not active");

  return prisma.marketplaceOffer.update({
    where: { id: offerId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
    include: OFFER_INCLUDES,
  });
}

// ─── Find Offers ─────────────────────────────────────────

export async function findOffersForListing(listingId: string) {
  return prisma.marketplaceOffer.findMany({
    where: { listingId, status: "ACTIVE" },
    include: OFFER_INCLUDES,
    orderBy: { priceAmount: "desc" },
  });
}

export async function findOffersByUser(userId: string) {
  return prisma.marketplaceOffer.findMany({
    where: { buyerId: userId },
    include: OFFER_INCLUDES,
    orderBy: { createdAt: "desc" },
  });
}

export async function findOffersForAsset(assetType: AssetType, assetId: string) {
  const where: Prisma.MarketplaceOfferWhereInput = { assetType, status: "ACTIVE" };
  switch (assetType) {
    case "CUB": where.cubId = assetId; break;
    case "TRAIT": where.traitDefinitionId = assetId; break;
    case "CRATE": where.crateDefinitionId = assetId; break;
  }
  return prisma.marketplaceOffer.findMany({
    where,
    include: OFFER_INCLUDES,
    orderBy: { priceAmount: "desc" },
  });
}

// ─── Helpers ─────────────────────────────────────────────

function getAssetId(offer: { assetType: AssetType; cubId: string | null; traitDefinitionId: string | null; crateDefinitionId: string | null }): string {
  switch (offer.assetType) {
    case "CUB": return offer.cubId!;
    case "TRAIT": return offer.traitDefinitionId!;
    case "CRATE": return offer.crateDefinitionId!;
  }
}

async function validateOwnership(
  tx: Prisma.TransactionClient,
  assetType: AssetType,
  assetId: string,
  userId: string,
  walletAddress: string,
  quantity: number,
) {
  switch (assetType) {
    case "CUB": {
      const cub = await tx.cub.findUnique({ where: { id: assetId } });
      if (!cub || cub.ownerId !== userId) throw new Error("Seller does not own this Cub");
      break;
    }
    case "TRAIT": {
      const ut = await tx.userTrait.findUnique({
        where: { walletAddress_traitDefinitionId: { walletAddress, traitDefinitionId: assetId } },
      });
      if (!ut || ut.quantity < quantity) throw new Error("Insufficient trait quantity");
      break;
    }
    case "CRATE": {
      const uc = await tx.userCrate.findUnique({
        where: { walletAddress_crateDefinitionId: { walletAddress, crateDefinitionId: assetId } },
      });
      if (!uc || uc.quantity < quantity) throw new Error("Insufficient crate quantity");
      break;
    }
  }
}

async function transferAsset(
  tx: Prisma.TransactionClient,
  assetType: AssetType,
  assetId: string,
  quantity: number,
  sellerId: string,
  sellerWallet: string,
  buyerId: string,
  buyerWallet: string,
) {
  switch (assetType) {
    case "CUB": {
      await tx.cub.update({ where: { id: assetId }, data: { ownerId: buyerId } });
      await transferStaking(assetId, buyerId, tx);
      break;
    }
    case "TRAIT": {
      const sellerTrait = await tx.userTrait.findUnique({
        where: { walletAddress_traitDefinitionId: { walletAddress: sellerWallet, traitDefinitionId: assetId } },
      });
      if (!sellerTrait || sellerTrait.quantity < quantity) throw new Error("Seller no longer has sufficient trait quantity");
      if (sellerTrait.quantity === quantity) {
        await tx.userTrait.delete({ where: { id: sellerTrait.id } });
      } else {
        await tx.userTrait.update({ where: { id: sellerTrait.id }, data: { quantity: { decrement: quantity } } });
      }
      await tx.userTrait.upsert({
        where: { walletAddress_traitDefinitionId: { walletAddress: buyerWallet, traitDefinitionId: assetId } },
        update: { quantity: { increment: quantity } },
        create: { walletAddress: buyerWallet, traitDefinitionId: assetId, quantity, acquiredFrom: "MARKETPLACE" },
      });
      break;
    }
    case "CRATE": {
      const sellerCrate = await tx.userCrate.findUnique({
        where: { walletAddress_crateDefinitionId: { walletAddress: sellerWallet, crateDefinitionId: assetId } },
      });
      if (!sellerCrate || sellerCrate.quantity < quantity) throw new Error("Seller no longer has sufficient crate quantity");
      if (sellerCrate.quantity === quantity) {
        await tx.userCrate.delete({ where: { id: sellerCrate.id } });
      } else {
        await tx.userCrate.update({ where: { id: sellerCrate.id }, data: { quantity: { decrement: quantity } } });
      }
      await tx.userCrate.upsert({
        where: { walletAddress_crateDefinitionId: { walletAddress: buyerWallet, crateDefinitionId: assetId } },
        update: { quantity: { increment: quantity } },
        create: { walletAddress: buyerWallet, crateDefinitionId: assetId, quantity },
      });
      break;
    }
  }
}

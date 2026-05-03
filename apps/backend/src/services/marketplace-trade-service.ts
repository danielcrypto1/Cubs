import { prisma } from "../lib/prisma.js";
import { economyEvents } from "../lib/economy-events.js";
import { withIntent } from "./transaction-intent-service.js";
import { transferStaking } from "./staking-service.js";
import { invalidateMarketplaceCache } from "./marketplace-cache.js";
import type { Prisma } from "@prisma/client";
import type { TradeAssetEntry } from "@cubs/shared";

// ─── Advisory Lock (same FNV-1a pattern) ─────────────────

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

// ─── Trade Includes ──────────────────────────────────────

const TRADE_INCLUDES = {
  proposer: { select: { walletAddress: true, displayName: true } },
  receiver: { select: { walletAddress: true, displayName: true } },
} as const;

// ─── Create Trade ────────────────────────────────────────

export async function createTrade(data: {
  proposerId: string;
  receiverId: string;
  offeredAssets: TradeAssetEntry[];
  requestedAssets: TradeAssetEntry[];
}) {
  const { proposerId, receiverId, offeredAssets, requestedAssets } = data;

  if (proposerId === receiverId) {
    throw new Error("Cannot trade with yourself");
  }
  if (!offeredAssets.length || !requestedAssets.length) {
    throw new Error("Both offered and requested assets are required");
  }

  // Validate receiver exists
  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) throw new Error("Receiver not found");

  // Validate proposer owns offered assets
  const proposer = await prisma.user.findUnique({ where: { id: proposerId } });
  if (!proposer) throw new Error("Proposer not found");
  await validateAssetOwnership(offeredAssets, proposerId, proposer.walletAddress);

  const trade = await prisma.marketplaceTrade.create({
    data: {
      proposer: { connect: { id: proposerId } },
      receiver: { connect: { id: receiverId } },
      offeredAssets: offeredAssets as unknown as Prisma.InputJsonValue,
      requestedAssets: requestedAssets as unknown as Prisma.InputJsonValue,
    },
    include: TRADE_INCLUDES,
  });

  economyEvents.emit("trade_created", {
    userId: proposerId,
    data: { tradeId: trade.id, receiverId, offeredCount: offeredAssets.length, requestedCount: requestedAssets.length },
  });

  return trade;
}

// ─── Accept Trade ────────────────────────────────────────

export async function acceptTrade(tradeId: string, receiverId: string) {
  return withIntent(receiverId, "MARKETPLACE_TRADE_ACCEPT", tradeId, async () => {
    return prisma.$transaction(async (tx) => {
      const trade = await tx.marketplaceTrade.findUnique({
        where: { id: tradeId },
        include: { proposer: true, receiver: true },
      });

      if (!trade) throw new Error("Trade not found");
      if (trade.status !== "PENDING") throw new Error("Trade is no longer pending");
      if (trade.receiverId !== receiverId) throw new Error("Only the receiver can accept this trade");

      // Lock both parties to prevent concurrent mutations
      await acquireLock(tx, trade.proposerId);
      await acquireLock(tx, trade.receiverId);

      const offeredAssets = trade.offeredAssets as unknown as TradeAssetEntry[];
      const requestedAssets = trade.requestedAssets as unknown as TradeAssetEntry[];

      // Re-validate both sides own their assets inside the lock
      await validateAssetOwnershipTx(tx, offeredAssets, trade.proposerId, trade.proposer.walletAddress);
      await validateAssetOwnershipTx(tx, requestedAssets, trade.receiverId, trade.receiver.walletAddress);

      // Transfer offered assets: proposer → receiver
      for (const asset of offeredAssets) {
        await transferAsset(
          tx, asset,
          trade.proposerId, trade.proposer.walletAddress,
          trade.receiverId, trade.receiver.walletAddress,
        );
      }

      // Transfer requested assets: receiver → proposer
      for (const asset of requestedAssets) {
        await transferAsset(
          tx, asset,
          trade.receiverId, trade.receiver.walletAddress,
          trade.proposerId, trade.proposer.walletAddress,
        );
      }

      const updated = await tx.marketplaceTrade.update({
        where: { id: tradeId },
        data: { status: "ACCEPTED", respondedAt: new Date() },
        include: TRADE_INCLUDES,
      });

      await invalidateMarketplaceCache();

      economyEvents.emit("trade_completed", {
        userId: receiverId,
        data: { tradeId, proposerId: trade.proposerId, offeredCount: offeredAssets.length, requestedCount: requestedAssets.length },
      });

      return updated;
    });
  });
}

// ─── Decline / Cancel Trade ──────────────────────────────

export async function declineTrade(tradeId: string, receiverId: string) {
  const trade = await prisma.marketplaceTrade.findUnique({ where: { id: tradeId } });
  if (!trade) throw new Error("Trade not found");
  if (trade.receiverId !== receiverId) throw new Error("Only the receiver can decline");
  if (trade.status !== "PENDING") throw new Error("Trade is not pending");

  return prisma.marketplaceTrade.update({
    where: { id: tradeId },
    data: { status: "DECLINED", respondedAt: new Date() },
    include: TRADE_INCLUDES,
  });
}

export async function cancelTrade(tradeId: string, proposerId: string) {
  const trade = await prisma.marketplaceTrade.findUnique({ where: { id: tradeId } });
  if (!trade) throw new Error("Trade not found");
  if (trade.proposerId !== proposerId) throw new Error("Only the proposer can cancel");
  if (trade.status !== "PENDING") throw new Error("Trade is not pending");

  return prisma.marketplaceTrade.update({
    where: { id: tradeId },
    data: { status: "CANCELLED", respondedAt: new Date() },
    include: TRADE_INCLUDES,
  });
}

// ─── Find Trades ─────────────────────────────────────────

export async function findTradesForUser(userId: string) {
  return prisma.marketplaceTrade.findMany({
    where: { OR: [{ proposerId: userId }, { receiverId: userId }] },
    include: TRADE_INCLUDES,
    orderBy: { createdAt: "desc" },
  });
}

export async function findTradeById(tradeId: string) {
  return prisma.marketplaceTrade.findUnique({
    where: { id: tradeId },
    include: TRADE_INCLUDES,
  });
}

// ─── Helpers ─────────────────────────────────────────────

async function validateAssetOwnership(assets: TradeAssetEntry[], userId: string, walletAddress: string) {
  for (const asset of assets) {
    switch (asset.type) {
      case "CUB": {
        const cub = await prisma.cub.findUnique({ where: { id: asset.id } });
        if (!cub || cub.ownerId !== userId) throw new Error(`You do not own Cub ${asset.id}`);
        break;
      }
      case "TRAIT": {
        const ut = await prisma.userTrait.findUnique({
          where: { walletAddress_traitDefinitionId: { walletAddress, traitDefinitionId: asset.id } },
        });
        if (!ut || ut.quantity < asset.quantity) throw new Error(`Insufficient quantity for Trait ${asset.id}`);
        break;
      }
      case "CRATE": {
        const uc = await prisma.userCrate.findUnique({
          where: { walletAddress_crateDefinitionId: { walletAddress, crateDefinitionId: asset.id } },
        });
        if (!uc || uc.quantity < asset.quantity) throw new Error(`Insufficient quantity for Crate ${asset.id}`);
        break;
      }
    }
  }
}

async function validateAssetOwnershipTx(tx: Prisma.TransactionClient, assets: TradeAssetEntry[], userId: string, walletAddress: string) {
  for (const asset of assets) {
    switch (asset.type) {
      case "CUB": {
        const cub = await tx.cub.findUnique({ where: { id: asset.id } });
        if (!cub || cub.ownerId !== userId) throw new Error(`User does not own Cub ${asset.id}`);
        break;
      }
      case "TRAIT": {
        const ut = await tx.userTrait.findUnique({
          where: { walletAddress_traitDefinitionId: { walletAddress, traitDefinitionId: asset.id } },
        });
        if (!ut || ut.quantity < asset.quantity) throw new Error(`Insufficient quantity for Trait ${asset.id}`);
        break;
      }
      case "CRATE": {
        const uc = await tx.userCrate.findUnique({
          where: { walletAddress_crateDefinitionId: { walletAddress, crateDefinitionId: asset.id } },
        });
        if (!uc || uc.quantity < asset.quantity) throw new Error(`Insufficient quantity for Crate ${asset.id}`);
        break;
      }
    }
  }
}

async function transferAsset(
  tx: Prisma.TransactionClient,
  asset: TradeAssetEntry,
  fromUserId: string,
  fromWallet: string,
  toUserId: string,
  toWallet: string,
) {
  switch (asset.type) {
    case "CUB": {
      await tx.cub.update({ where: { id: asset.id }, data: { ownerId: toUserId } });
      await transferStaking(asset.id, toUserId, tx);
      break;
    }
    case "TRAIT": {
      const sellerTrait = await tx.userTrait.findUnique({
        where: { walletAddress_traitDefinitionId: { walletAddress: fromWallet, traitDefinitionId: asset.id } },
      });
      if (!sellerTrait || sellerTrait.quantity < asset.quantity) {
        throw new Error(`Transfer failed: insufficient trait quantity for ${asset.id}`);
      }
      if (sellerTrait.quantity === asset.quantity) {
        await tx.userTrait.delete({ where: { id: sellerTrait.id } });
      } else {
        await tx.userTrait.update({ where: { id: sellerTrait.id }, data: { quantity: { decrement: asset.quantity } } });
      }
      await tx.userTrait.upsert({
        where: { walletAddress_traitDefinitionId: { walletAddress: toWallet, traitDefinitionId: asset.id } },
        update: { quantity: { increment: asset.quantity } },
        create: { walletAddress: toWallet, traitDefinitionId: asset.id, quantity: asset.quantity, acquiredFrom: "MARKETPLACE" },
      });
      break;
    }
    case "CRATE": {
      const sellerCrate = await tx.userCrate.findUnique({
        where: { walletAddress_crateDefinitionId: { walletAddress: fromWallet, crateDefinitionId: asset.id } },
      });
      if (!sellerCrate || sellerCrate.quantity < asset.quantity) {
        throw new Error(`Transfer failed: insufficient crate quantity for ${asset.id}`);
      }
      if (sellerCrate.quantity === asset.quantity) {
        await tx.userCrate.delete({ where: { id: sellerCrate.id } });
      } else {
        await tx.userCrate.update({ where: { id: sellerCrate.id }, data: { quantity: { decrement: asset.quantity } } });
      }
      await tx.userCrate.upsert({
        where: { walletAddress_crateDefinitionId: { walletAddress: toWallet, crateDefinitionId: asset.id } },
        update: { quantity: { increment: asset.quantity } },
        create: { walletAddress: toWallet, crateDefinitionId: asset.id, quantity: asset.quantity },
      });
      break;
    }
  }
}

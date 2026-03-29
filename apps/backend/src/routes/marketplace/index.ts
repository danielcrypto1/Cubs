import type { FastifyInstance } from "fastify";
import { resolveUser } from "../../middleware/resolve-user.js";
import {
  findActiveListings,
  findListingById,
  createListing,
  completePurchase,
  cancelListing,
} from "../../services/marketplace-service.js";
import {
  createOffer,
  acceptOffer,
  cancelOffer,
  findOffersForListing,
  findOffersByUser,
} from "../../services/marketplace-offer-service.js";
import {
  createTrade,
  acceptTrade,
  declineTrade,
  cancelTrade,
  findTradesForUser,
  findTradeById,
} from "../../services/marketplace-trade-service.js";
import { IntentError } from "../../services/transaction-intent-service.js";
import { PawsError } from "../../services/paws-service.js";
import type { AssetType, PriceType } from "@prisma/client";
import type { TradeAssetEntry } from "@cubs/shared";

export default async function marketplaceRoutes(fastify: FastifyInstance) {
  // ─── Listings ──────────────────────────────────────────

  // GET / — paginated listings with filters (public)
  fastify.get<{
    Querystring: {
      assetType?: string;
      rarity?: string;
      priceType?: string;
      minPrice?: string;
      maxPrice?: string;
      sortBy?: string;
      page?: string;
      limit?: string;
    };
  }>("/", async (request) => {
    const { assetType, rarity, priceType, minPrice, maxPrice, sortBy, page, limit } = request.query;
    const result = await findActiveListings({
      assetType: assetType as AssetType | undefined,
      rarity,
      priceType: priceType as PriceType | undefined,
      minPrice,
      maxPrice,
      sortBy,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return { data: result };
  });

  // GET /:id — single listing detail (public)
  fastify.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const listing = await findListingById(request.params.id);
    if (!listing) {
      return reply.status(404).send({ error: "LISTING_NOT_FOUND", message: "Listing not found" });
    }
    return { data: listing };
  });

  // POST /list — create a listing
  fastify.post<{
    Body: {
      assetType: AssetType;
      assetId: string;
      quantity?: number;
      priceType: PriceType;
      priceAmount: string;
    };
  }>("/list", { preHandler: [resolveUser] }, async (request, reply) => {
    const { userId, walletAddress } = request.resolvedUser!;
    const { assetType, assetId, quantity = 1, priceType, priceAmount } = request.body;

    if (!assetType || !assetId || !priceType || !priceAmount) {
      return reply.status(400).send({ error: "MISSING_FIELDS", message: "Missing required fields" });
    }

    try {
      const listing = await createListing({
        assetType,
        assetId,
        quantity,
        priceType,
        priceAmount,
        sellerId: userId,
        sellerWallet: walletAddress,
      });
      return reply.status(201).send({ data: listing });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create listing";
      if (message.includes("already listed")) {
        return reply.status(409).send({ error: "ALREADY_LISTED", message });
      }
      if (message.includes("do not own") || message.includes("Insufficient")) {
        return reply.status(403).send({ error: "INSUFFICIENT_OWNERSHIP", message });
      }
      return reply.status(400).send({ error: "LISTING_FAILED", message });
    }
  });

  // POST /buy — purchase a listing (intent-protected)
  fastify.post<{ Body: { listingId: string } }>(
    "/buy",
    { preHandler: [resolveUser] },
    async (request, reply) => {
      const { userId, walletAddress } = request.resolvedUser!;

      try {
        const result = await completePurchase(request.body.listingId, userId, walletAddress);
        return { data: result };
      } catch (err) {
        return handleMarketplaceError(err, reply);
      }
    },
  );

  // POST /cancel — cancel own listing
  fastify.post<{ Body: { listingId: string } }>(
    "/cancel",
    { preHandler: [resolveUser] },
    async (request, reply) => {
      const { userId } = request.resolvedUser!;

      try {
        const listing = await cancelListing(request.body.listingId, userId);
        return { data: listing };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Cancel failed";
        if (message.includes("Not your")) {
          return reply.status(403).send({ error: "NOT_OWNER", message });
        }
        return reply.status(400).send({ error: "CANCEL_FAILED", message });
      }
    },
  );

  // ─── Offers ────────────────────────────────────────────

  // GET /offers/listing/:id — offers on a listing (public)
  fastify.get<{ Params: { id: string } }>("/offers/listing/:id", async (request) => {
    const offers = await findOffersForListing(request.params.id);
    return { data: offers };
  });

  // GET /offers/mine — user's offers
  fastify.get("/offers/mine", { preHandler: [resolveUser] }, async (request) => {
    const offers = await findOffersByUser(request.resolvedUser!.userId);
    return { data: offers };
  });

  // POST /offer — create an offer
  fastify.post<{
    Body: {
      listingId?: string;
      assetType: AssetType;
      assetId: string;
      quantity?: number;
      priceType: PriceType;
      priceAmount: string;
      expiresAt?: string;
    };
  }>("/offer", { preHandler: [resolveUser] }, async (request, reply) => {
    const { userId } = request.resolvedUser!;
    const { listingId, assetType, assetId, quantity = 1, priceType, priceAmount, expiresAt } = request.body;

    if (!assetType || !assetId || !priceType || !priceAmount) {
      return reply.status(400).send({ error: "MISSING_FIELDS", message: "Missing required fields" });
    }

    try {
      const offer = await createOffer({
        listingId,
        assetType,
        assetId,
        quantity,
        buyerId: userId,
        priceType,
        priceAmount,
        expiresAt,
      });
      return reply.status(201).send({ data: offer });
    } catch (err) {
      return handleMarketplaceError(err, reply);
    }
  });

  // POST /offer/accept — accept an offer (intent-protected)
  fastify.post<{ Body: { offerId: string } }>(
    "/offer/accept",
    { preHandler: [resolveUser] },
    async (request, reply) => {
      const { userId, walletAddress } = request.resolvedUser!;

      try {
        const result = await acceptOffer(request.body.offerId, userId, walletAddress);
        return { data: result };
      } catch (err) {
        return handleMarketplaceError(err, reply);
      }
    },
  );

  // POST /offer/cancel — cancel own offer
  fastify.post<{ Body: { offerId: string } }>(
    "/offer/cancel",
    { preHandler: [resolveUser] },
    async (request, reply) => {
      const { userId } = request.resolvedUser!;

      try {
        const result = await cancelOffer(request.body.offerId, userId);
        return { data: result };
      } catch (err) {
        return handleMarketplaceError(err, reply);
      }
    },
  );

  // ─── Trades ────────────────────────────────────────────

  // GET /trades/mine — user's trades
  fastify.get("/trades/mine", { preHandler: [resolveUser] }, async (request) => {
    const trades = await findTradesForUser(request.resolvedUser!.userId);
    return { data: trades };
  });

  // GET /trades/:id — single trade detail
  fastify.get<{ Params: { id: string } }>(
    "/trades/:id",
    { preHandler: [resolveUser] },
    async (request, reply) => {
      const trade = await findTradeById(request.params.id);
      if (!trade) {
        return reply.status(404).send({ error: "TRADE_NOT_FOUND", message: "Trade not found" });
      }
      const { userId } = request.resolvedUser!;
      if (trade.proposerId !== userId && trade.receiverId !== userId) {
        return reply.status(403).send({ error: "NOT_PARTICIPANT", message: "Not a participant in this trade" });
      }
      return { data: trade };
    },
  );

  // POST /trade — create a trade
  fastify.post<{
    Body: {
      receiverId: string;
      offeredAssets: TradeAssetEntry[];
      requestedAssets: TradeAssetEntry[];
    };
  }>("/trade", { preHandler: [resolveUser] }, async (request, reply) => {
    const { userId } = request.resolvedUser!;
    const { receiverId, offeredAssets, requestedAssets } = request.body;

    if (!receiverId || !offeredAssets?.length || !requestedAssets?.length) {
      return reply.status(400).send({ error: "MISSING_FIELDS", message: "Missing required fields" });
    }

    try {
      const trade = await createTrade({
        proposerId: userId,
        receiverId,
        offeredAssets,
        requestedAssets,
      });
      return reply.status(201).send({ data: trade });
    } catch (err) {
      return handleMarketplaceError(err, reply);
    }
  });

  // POST /trade/accept — accept a trade (intent-protected)
  fastify.post<{ Body: { tradeId: string } }>(
    "/trade/accept",
    { preHandler: [resolveUser] },
    async (request, reply) => {
      const { userId } = request.resolvedUser!;

      try {
        const result = await acceptTrade(request.body.tradeId, userId);
        return { data: result };
      } catch (err) {
        return handleMarketplaceError(err, reply);
      }
    },
  );

  // POST /trade/decline — decline a trade
  fastify.post<{ Body: { tradeId: string } }>(
    "/trade/decline",
    { preHandler: [resolveUser] },
    async (request, reply) => {
      const { userId } = request.resolvedUser!;

      try {
        const result = await declineTrade(request.body.tradeId, userId);
        return { data: result };
      } catch (err) {
        return handleMarketplaceError(err, reply);
      }
    },
  );

  // POST /trade/cancel — cancel a trade (proposer only)
  fastify.post<{ Body: { tradeId: string } }>(
    "/trade/cancel",
    { preHandler: [resolveUser] },
    async (request, reply) => {
      const { userId } = request.resolvedUser!;

      try {
        const result = await cancelTrade(request.body.tradeId, userId);
        return { data: result };
      } catch (err) {
        return handleMarketplaceError(err, reply);
      }
    },
  );
}

// ─── Shared Error Handler ────────────────────────────────

function handleMarketplaceError(err: unknown, reply: { status: (code: number) => { send: (body: unknown) => unknown } }) {
  if (err instanceof IntentError) {
    return reply.status(429).send({ error: "INTENT_LOCKED", message: err.message });
  }
  if (err instanceof PawsError) {
    return reply.status(400).send({ error: err.code, message: err.message });
  }
  const message = err instanceof Error ? err.message : "Operation failed";
  if (message.includes("not found")) {
    return reply.status(404).send({ error: "NOT_FOUND", message });
  }
  if (message.includes("own") || message.includes("Not your") || message.includes("Only the")) {
    return reply.status(403).send({ error: "FORBIDDEN", message });
  }
  if (message.includes("no longer") || message.includes("expired") || message.includes("not active") || message.includes("not pending")) {
    return reply.status(409).send({ error: "CONFLICT", message });
  }
  if (message.includes("Insufficient")) {
    return reply.status(400).send({ error: "INSUFFICIENT", message });
  }
  return reply.status(400).send({ error: "MARKETPLACE_ERROR", message });
}

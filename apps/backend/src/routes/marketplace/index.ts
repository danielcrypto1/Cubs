import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../middleware/require-auth.js";
import {
  findActiveListings,
  findListingById,
  createListing,
  completePurchase,
  cancelListing,
} from "../../services/marketplace-service.js";
import type { AssetType } from "@prisma/client";

export default async function marketplaceRoutes(fastify: FastifyInstance) {
  // GET / — paginated listings with filters
  fastify.get<{
    Querystring: {
      assetType?: string;
      rarity?: string;
      minPrice?: string;
      maxPrice?: string;
      sortBy?: string;
      page?: string;
      limit?: string;
    };
  }>("/", async (request) => {
    const { assetType, rarity, minPrice, maxPrice, sortBy, page, limit } = request.query;
    const result = await findActiveListings({
      assetType: assetType as AssetType | undefined,
      rarity,
      minPrice,
      maxPrice,
      sortBy,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return { data: result };
  });

  // GET /:id — single listing detail
  fastify.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const listing = await findListingById(request.params.id);
    if (!listing) {
      return reply.status(404).send({ error: "Listing not found" });
    }
    return { data: listing };
  });

  // POST /list-item — create a listing
  fastify.post<{
    Body: {
      assetType: AssetType;
      assetId: string;
      quantity?: number;
      priceWei: string;
    };
  }>("/list-item", { preHandler: [requireAuth] }, async (request, reply) => {
    const walletAddress = request.session.siwe!.address.toLowerCase();
    const user = await fastify.prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const { assetType, assetId, quantity = 1, priceWei } = request.body;

    if (!assetType || !assetId || !priceWei) {
      return reply.status(400).send({ error: "Missing required fields" });
    }

    try {
      const listing = await createListing({
        assetType,
        assetId,
        quantity,
        priceWei,
        sellerId: user.id,
        sellerWallet: walletAddress,
      });
      return reply.status(201).send({ data: listing });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create listing";
      if (message.includes("already listed")) {
        return reply.status(409).send({ error: message });
      }
      if (message.includes("do not own") || message.includes("Insufficient")) {
        return reply.status(403).send({ error: message });
      }
      return reply.status(400).send({ error: message });
    }
  });

  // POST /buy-item — purchase a listing
  fastify.post<{ Body: { listingId: string } }>(
    "/buy-item",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const walletAddress = request.session.siwe!.address.toLowerCase();
      const user = await fastify.prisma.user.findUnique({ where: { walletAddress } });
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      try {
        const result = await completePurchase(request.body.listingId, user.id, walletAddress);
        return { data: result };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Purchase failed";
        if (message.includes("not found")) {
          return reply.status(404).send({ error: message });
        }
        if (message.includes("own listing")) {
          return reply.status(403).send({ error: message });
        }
        return reply.status(400).send({ error: message });
      }
    },
  );

  // POST /cancel-listing — cancel own listing
  fastify.post<{ Body: { listingId: string } }>(
    "/cancel-listing",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const walletAddress = request.session.siwe!.address.toLowerCase();
      const user = await fastify.prisma.user.findUnique({ where: { walletAddress } });
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      try {
        const listing = await cancelListing(request.body.listingId, user.id);
        return { data: listing };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Cancel failed";
        if (message.includes("Not your")) {
          return reply.status(403).send({ error: message });
        }
        return reply.status(400).send({ error: message });
      }
    },
  );
}

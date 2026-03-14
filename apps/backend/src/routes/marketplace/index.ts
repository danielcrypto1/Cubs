import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../middleware/require-auth.js";
import {
  findActiveListings,
  createListing,
  completePurchase,
} from "../../services/marketplace-service.js";

export default async function marketplaceRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { page?: string; limit?: string } }>(
    "/",
    async (request) => {
      const { page, limit } = request.query;
      return findActiveListings({
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
    }
  );

  fastify.post<{ Body: { cubId: string; priceWei: string } }>(
    "/list",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const user = await fastify.prisma.user.findUnique({
        where: { walletAddress: request.session.siwe!.address.toLowerCase() },
      });
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }
      const listing = await createListing({
        cubId: request.body.cubId,
        sellerId: user.id,
        priceWei: request.body.priceWei,
      });
      return reply.status(201).send(listing);
    }
  );

  fastify.post<{ Body: { listingId: string; txHash: string } }>(
    "/buy",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const user = await fastify.prisma.user.findUnique({
        where: { walletAddress: request.session.siwe!.address.toLowerCase() },
      });
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }
      const listing = await completePurchase(
        request.body.listingId,
        user.id,
        request.body.txHash
      );
      return reply.send(listing);
    }
  );
}

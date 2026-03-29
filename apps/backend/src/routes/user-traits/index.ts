import type { FastifyInstance } from "fastify";
import { resolveUser } from "../../middleware/resolve-user.js";
import { findUserTraits } from "../../services/user-trait-service.js";

export default async function userTraitRoutes(fastify: FastifyInstance) {
  // GET /api/user-traits — list traits owned by authenticated wallet
  fastify.get("/", { preHandler: [resolveUser] }, async (request) => {
    const { walletAddress } = request.resolvedUser!;
    const traits = await findUserTraits(walletAddress);
    return { data: traits };
  });
}

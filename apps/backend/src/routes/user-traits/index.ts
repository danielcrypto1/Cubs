import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../middleware/require-auth.js";
import { findUserTraits } from "../../services/user-trait-service.js";

export default async function userTraitRoutes(fastify: FastifyInstance) {
  // GET /api/user-traits — list traits owned by authenticated wallet
  fastify.get("/", { preHandler: [requireAuth] }, async (request) => {
    const address = request.session.siwe!.address;
    const traits = await findUserTraits(address);
    return { data: traits };
  });
}

import type { FastifyInstance } from "fastify";
import { resolveUser } from "../../middleware/resolve-user.js";
import { getBalance, getHistory } from "../../services/paws-service.js";

export default async function pawsRoutes(fastify: FastifyInstance) {
  // GET /api/paws/balance — current PAWS balance (derived from ledger)
  fastify.get("/balance", { preHandler: [resolveUser] }, async (request) => {
    const { userId } = request.resolvedUser!;
    const result = await getBalance(userId);
    return { data: result };
  });

  // GET /api/paws/history — paginated transaction history
  fastify.get<{ Querystring: { page?: string; limit?: string } }>(
    "/history",
    { preHandler: [resolveUser] },
    async (request) => {
      const { userId } = request.resolvedUser!;
      const { page, limit } = request.query;
      const result = await getHistory(userId, {
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      return { data: result };
    },
  );
}

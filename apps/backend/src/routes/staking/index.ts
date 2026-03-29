import type { FastifyInstance } from "fastify";
import { resolveUser } from "../../middleware/resolve-user.js";
import { getAccrued, claimAll, StakingError } from "../../services/staking-service.js";
import { IntentError } from "../../services/transaction-intent-service.js";

export default async function stakingRoutes(fastify: FastifyInstance) {
  // GET /api/staking/accrued — unclaimed PAWS across all staked cubs + cooldown info
  fastify.get("/accrued", { preHandler: [resolveUser] }, async (request) => {
    const { userId } = request.resolvedUser!;
    const result = await getAccrued(userId);
    return { data: result };
  });

  // POST /api/staking/claim — claim all accrued PAWS (intent-protected)
  fastify.post("/claim", { preHandler: [resolveUser] }, async (request, reply) => {
    const { userId } = request.resolvedUser!;

    try {
      const result = await claimAll(userId);
      return { data: result };
    } catch (err) {
      if (err instanceof IntentError) {
        return reply.status(429).send({ error: err.code, message: err.message });
      }
      if (err instanceof StakingError) {
        const status = err.code === "CLAIM_COOLDOWN" ? 429 : 400;
        return reply.status(status).send({ error: err.code, message: err.message });
      }
      const message = err instanceof Error ? err.message : "Claim failed";
      return reply.status(400).send({ error: "CLAIM_FAILED", message });
    }
  });
}

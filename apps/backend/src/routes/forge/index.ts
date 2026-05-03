import type { FastifyInstance, FastifyReply } from "fastify";
import { resolveUser } from "../../middleware/resolve-user.js";
import { getForgePreview, applyForge, ForgeError } from "../../services/forge-service.js";
import { IntentError } from "../../services/transaction-intent-service.js";
import type { ForgeChange } from "@cubs/shared";

export default async function forgeRoutes(fastify: FastifyInstance) {
  // POST /api/forge/preview — compute composed traits + rarity (no side effects)
  fastify.post("/preview", { preHandler: [resolveUser] }, async (request, reply) => {
    const { cubId, changes } = request.body as { cubId: string; changes: ForgeChange[] };
    const { walletAddress } = request.resolvedUser!;

    try {
      const result = await getForgePreview(cubId, walletAddress, changes);
      return { data: result };
    } catch (err) {
      return handleForgeError(err, reply);
    }
  });

  // POST /api/forge/apply — destructive: burns traits, updates cub (auth required)
  fastify.post("/apply", { preHandler: [resolveUser] }, async (request, reply) => {
    const { cubId, changes } = request.body as { cubId: string; changes: ForgeChange[] };
    const { userId, walletAddress } = request.resolvedUser!;

    try {
      const result = await applyForge(userId, cubId, walletAddress, changes);
      return { data: result };
    } catch (err) {
      return handleForgeError(err, reply);
    }
  });
}

function handleForgeError(err: unknown, reply: FastifyReply) {
  if (err instanceof IntentError) {
    return reply.status(429).send({ error: err.code, message: err.message });
  }
  if (err instanceof ForgeError) {
    const status = err.code === "NOT_OWNER" || err.code === "TRAIT_NOT_OWNED"
      ? 403
      : err.code === "CUB_NOT_FOUND" || err.code === "TRAIT_NOT_FOUND"
        ? 404
        : 400;
    return reply.status(status).send({ error: err.code, message: err.message });
  }
  const message = err instanceof Error ? err.message : "Forge operation failed";
  return reply.status(400).send({ error: "FORGE_ERROR", message });
}

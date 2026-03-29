import type { FastifyInstance, FastifyReply } from "fastify";
import { resolveUser } from "../../middleware/resolve-user.js";
import {
  findUserCrates,
  findAllCrateDefinitions,
  getLootTable,
  openCrate,
  purchaseCrate,
  CrateError,
} from "../../services/crate-service.js";
import { IntentError } from "../../services/transaction-intent-service.js";
import { PawsError } from "../../services/paws-service.js";
import { RateLimitError } from "../../lib/rate-limiter.js";

export default async function crateRoutes(fastify: FastifyInstance) {
  // GET /api/crates — user's crate inventory (auth required)
  fastify.get("/", { preHandler: [resolveUser] }, async (request) => {
    const { walletAddress } = request.resolvedUser!;
    const crates = await findUserCrates(walletAddress);
    return { data: crates };
  });

  // GET /api/crates/definitions — all crate types (public)
  fastify.get("/definitions", async () => {
    const definitions = await findAllCrateDefinitions();
    return { data: definitions };
  });

  // GET /api/crates/loot-table/:crateDefinitionId — probabilities (public)
  fastify.get("/loot-table/:crateDefinitionId", async (request) => {
    const { crateDefinitionId } = request.params as { crateDefinitionId: string };
    const entries = await getLootTable(crateDefinitionId);
    return { data: entries };
  });

  // POST /api/crates/purchase — buy a crate with PAWS (auth required)
  fastify.post("/purchase", { preHandler: [resolveUser] }, async (request, reply) => {
    const { crateDefinitionId, quantity } = request.body as {
      crateDefinitionId: string;
      quantity?: number;
    };
    const { userId, walletAddress } = request.resolvedUser!;

    try {
      const result = await purchaseCrate(userId, walletAddress, crateDefinitionId, quantity);
      return { data: result };
    } catch (err) {
      return handleCrateError(err, reply);
    }
  });

  // POST /api/crates/open — open a crate (auth required)
  fastify.post("/open", { preHandler: [resolveUser] }, async (request, reply) => {
    const { crateDefinitionId } = request.body as { crateDefinitionId: string };
    const { walletAddress, userId } = request.resolvedUser!;

    try {
      const result = await openCrate(walletAddress, crateDefinitionId, userId);
      return { data: result };
    } catch (err) {
      return handleCrateError(err, reply);
    }
  });
}

function handleCrateError(err: unknown, reply: FastifyReply) {
  if (err instanceof RateLimitError) {
    return reply
      .status(429)
      .header("Retry-After", String(err.retryAfter))
      .send({ error: err.code, message: err.message, retryAfter: err.retryAfter });
  }
  if (err instanceof IntentError) {
    return reply.status(429).send({ error: err.code, message: err.message });
  }
  if (err instanceof PawsError) {
    const status = err.code === "INSUFFICIENT_BALANCE" ? 402 : 400;
    return reply.status(status).send({ error: err.code, message: err.message });
  }
  if (err instanceof CrateError) {
    return reply.status(400).send({ error: err.code, message: err.message });
  }
  const message = err instanceof Error ? err.message : "Operation failed";
  return reply.status(400).send({ error: "CRATE_ERROR", message });
}

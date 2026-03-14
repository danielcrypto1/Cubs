import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../middleware/require-auth.js";
import {
  findUserCrates,
  findAllCrateDefinitions,
  getLootTable,
  openCrate,
} from "../../services/crate-service.js";

export default async function crateRoutes(fastify: FastifyInstance) {
  // GET /api/crates — user's crate inventory (auth required)
  fastify.get("/", { preHandler: [requireAuth] }, async (request) => {
    const address = request.session.siwe!.address;
    const crates = await findUserCrates(address);
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

  // POST /api/crates/open — open a crate (auth required)
  fastify.post("/open", { preHandler: [requireAuth] }, async (request, reply) => {
    const { crateDefinitionId } = request.body as { crateDefinitionId: string };
    const address = request.session.siwe!.address;

    try {
      const result = await openCrate(address, crateDefinitionId);
      return { data: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to open crate";
      return reply.status(400).send({ error: message });
    }
  });
}

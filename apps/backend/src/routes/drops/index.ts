import type { FastifyInstance } from "fastify";
import { findActiveDrops, findDropById, findFeaturedDrops } from "../../services/drop-service.js";

export default async function dropRoutes(fastify: FastifyInstance) {
  // GET /api/drops — all active/scheduled/ended drops (public)
  fastify.get("/", async () => {
    const drops = await findActiveDrops();
    return { data: drops };
  });

  // GET /api/drops/featured — featured drops for homepage banner (public)
  fastify.get("/featured", async () => {
    const drops = await findFeaturedDrops();
    return { data: drops };
  });

  // GET /api/drops/:id — single drop detail (public)
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const drop = await findDropById(id);

    if (!drop) {
      return reply.status(404).send({ error: "NOT_FOUND", message: "Drop not found" });
    }

    // Don't expose DRAFT drops to the public
    if (drop.status === "DRAFT") {
      return reply.status(404).send({ error: "NOT_FOUND", message: "Drop not found" });
    }

    return { data: drop };
  });
}

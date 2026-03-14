import type { FastifyInstance } from "fastify";
import { findAllTraitDefinitions } from "../../services/trait-registry-service.js";
import type { TraitCategory, TraitRarity } from "@prisma/client";

export default async function traitRegistryRoutes(fastify: FastifyInstance) {
  // GET /api/trait-registry — list all trait definitions (public)
  fastify.get("/", async (request) => {
    const { category, rarity } = request.query as {
      category?: TraitCategory;
      rarity?: TraitRarity;
    };

    const definitions = await findAllTraitDefinitions({ category, rarity });
    return { data: definitions };
  });
}

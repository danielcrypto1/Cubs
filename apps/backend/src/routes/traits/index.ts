import type { FastifyInstance } from "fastify";
import { getDistinctTraitTypes, findTraitsByCubId } from "../../services/trait-service.js";

export default async function traitRoutes(fastify: FastifyInstance) {
  fastify.get("/", async () => {
    return getDistinctTraitTypes();
  });

  fastify.get<{ Params: { cubId: string } }>(
    "/:cubId",
    async (request) => {
      return findTraitsByCubId(request.params.cubId);
    }
  );
}

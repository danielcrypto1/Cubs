import type { FastifyInstance } from "fastify";
import { requireAdmin } from "../../middleware/require-admin.js";
import { findAllCubs, findCubById, createCub } from "../../services/cub-service.js";

export default async function cubRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { owner?: string; page?: string; limit?: string } }>(
    "/",
    async (request) => {
      const { owner, page, limit } = request.query;
      return findAllCubs({
        owner,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/:id",
    async (request, reply) => {
      const cub = await findCubById(request.params.id);
      if (!cub) {
        return reply.status(404).send({ error: "Cub not found" });
      }
      return reply.send(cub);
    }
  );

  fastify.post<{
    Body: {
      tokenId: number;
      name?: string;
      description?: string;
      imageUrl?: string;
      metadataUri?: string;
      ownerId: string;
    };
  }>(
    "/",
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const cub = await createCub(request.body);
      return reply.status(201).send(cub);
    }
  );
}

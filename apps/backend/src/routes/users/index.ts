import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../middleware/require-auth.js";
import { findUserByAddress, updateUserProfile } from "../../services/user-service.js";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { address: string } }>(
    "/:address",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const user = await findUserByAddress(request.params.address);
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }
      return reply.send(user);
    }
  );

  fastify.put<{ Params: { address: string }; Body: { displayName?: string; avatarUrl?: string } }>(
    "/:address",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const sessionAddress = request.session.siwe!.address.toLowerCase();
      const targetAddress = request.params.address.toLowerCase();

      if (sessionAddress !== targetAddress) {
        return reply.status(403).send({ error: "Can only update your own profile" });
      }

      const user = await updateUserProfile(targetAddress, request.body);
      return reply.send(user);
    }
  );
}

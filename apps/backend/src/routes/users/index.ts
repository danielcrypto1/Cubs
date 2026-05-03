import type { FastifyInstance } from "fastify";
import { resolveUser } from "../../middleware/resolve-user.js";
import { findUserByAddress, updateUserProfile } from "../../services/user-service.js";

export default async function userRoutes(fastify: FastifyInstance) {
  // GET /api/users/me — authenticated user's profile
  fastify.get("/me", { preHandler: [resolveUser] }, async (request, reply) => {
    const { walletAddress } = request.resolvedUser!;
    const user = await findUserByAddress(walletAddress);
    if (!user) {
      return reply.status(404).send({ error: "USER_NOT_FOUND", message: "User not found" });
    }
    return { data: user };
  });

  // GET /api/users/:address — public profile lookup
  fastify.get<{ Params: { address: string } }>(
    "/:address",
    async (request, reply) => {
      const user = await findUserByAddress(request.params.address);
      if (!user) {
        return reply.status(404).send({ error: "USER_NOT_FOUND", message: "User not found" });
      }
      return { data: user };
    }
  );

  // PUT /api/users/me — update own profile
  fastify.put<{ Body: { displayName?: string; avatarUrl?: string } }>(
    "/me",
    { preHandler: [resolveUser] },
    async (request) => {
      const { walletAddress } = request.resolvedUser!;
      const user = await updateUserProfile(walletAddress, request.body);
      return { data: user };
    }
  );
}

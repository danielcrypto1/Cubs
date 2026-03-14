import type { FastifyRequest, FastifyReply } from "fastify";

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  if (!request.session.siwe) {
    return reply.status(401).send({ error: "Authentication required" });
  }
}

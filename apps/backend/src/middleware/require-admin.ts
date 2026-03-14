import type { FastifyRequest, FastifyReply } from "fastify";
import { config } from "../lib/config.js";

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!request.session.siwe) {
    return reply.status(401).send({ error: "Authentication required" });
  }

  const address = request.session.siwe.address.toLowerCase();
  if (!config.adminWallets.includes(address)) {
    return reply.status(403).send({ error: "Admin access required" });
  }
}

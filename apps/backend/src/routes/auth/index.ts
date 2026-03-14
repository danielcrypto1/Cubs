import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { verifySiweSignature, extractAddress, extractNonce, extractChainId } from "../../lib/siwe.js";
import { upsertUser } from "../../services/user-service.js";

export default async function authRoutes(fastify: FastifyInstance) {
  // Generate nonce for SIWE
  fastify.get("/nonce", async (request, reply) => {
    const nonce = crypto.randomBytes(16).toString("hex");
    request.session.nonce = nonce;
    return reply.send(nonce);
  });

  // Verify SIWE signature
  fastify.post<{ Body: { message: string; signature: string } }>(
    "/verify",
    async (request, reply) => {
      const { message, signature } = request.body;

      if (!message || !signature) {
        return reply.status(400).send({ error: "Message and signature are required" });
      }

      // Verify nonce matches session
      const nonce = extractNonce(message);
      if (nonce !== request.session.nonce) {
        return reply.status(422).send({ error: "Invalid nonce" });
      }

      // Verify signature
      const valid = await verifySiweSignature(message, signature as `0x${string}`);
      if (!valid) {
        return reply.status(422).send({ error: "Invalid signature" });
      }

      const address = extractAddress(message);
      const chainId = extractChainId(message);

      // Upsert user in database
      await upsertUser(address);

      // Set session
      request.session.siwe = { address, chainId };
      delete request.session.nonce;

      return reply.send({ address, chainId });
    }
  );

  // Logout
  fastify.post("/logout", async (request, reply) => {
    request.session.destroy();
    return reply.send({ ok: true });
  });

  // Get current session
  fastify.get("/session", async (request, reply) => {
    if (request.session.siwe) {
      return reply.send(request.session.siwe);
    }
    return reply.send(null);
  });
}

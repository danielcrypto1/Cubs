import type { FastifyRequest, FastifyReply } from "fastify";
import { config } from "../lib/config.js";
import { prisma } from "../lib/prisma.js";

/**
 * Unified auth middleware that resolves identity from either:
 * - Website: SIWE session cookie → walletAddress
 * - Discord bot: X-Service-Key + X-Discord-Id headers → walletAddress via DB lookup
 *
 * Sets request.resolvedUser on success.
 */
export async function resolveUser(request: FastifyRequest, reply: FastifyReply) {
  // Path A: Website session (SIWE)
  if (request.session.siwe) {
    const address = request.session.siwe.address.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
      select: { id: true, walletAddress: true },
    });

    if (!user) {
      return reply.status(401).send({ error: "USER_NOT_FOUND", message: "User account not found" });
    }

    request.resolvedUser = {
      userId: user.id,
      walletAddress: user.walletAddress,
      source: "website",
    };
    return;
  }

  // Path B: Discord bot service key
  const serviceKey = request.headers["x-service-key"] as string | undefined;
  const discordId = request.headers["x-discord-id"] as string | undefined;

  if (serviceKey && discordId) {
    if (!config.BOT_SERVICE_KEY || serviceKey !== config.BOT_SERVICE_KEY) {
      return reply.status(401).send({ error: "INVALID_SERVICE_KEY", message: "Invalid service key" });
    }

    const user = await prisma.user.findUnique({
      where: { discordId },
      select: { id: true, walletAddress: true },
    });

    if (!user) {
      return reply.status(403).send({ error: "WALLET_NOT_LINKED", message: "Discord account has no linked wallet" });
    }

    request.resolvedUser = {
      userId: user.id,
      walletAddress: user.walletAddress,
      source: "discord",
    };
    return;
  }

  return reply.status(401).send({ error: "NOT_AUTHENTICATED", message: "Authentication required" });
}

/**
 * Admin-only middleware. Must be used AFTER resolveUser.
 * Checks wallet against admin whitelist.
 */
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  // resolveUser must run first
  if (!request.resolvedUser) {
    return reply.status(401).send({ error: "NOT_AUTHENTICATED", message: "Authentication required" });
  }

  const address = request.resolvedUser.walletAddress.toLowerCase();
  if (!config.adminWallets.includes(address)) {
    return reply.status(403).send({ error: "ADMIN_REQUIRED", message: "Admin access required" });
  }
}

/**
 * Service-key-only middleware for privileged bot operations (paws credit/debit).
 * Also allows admin wallets via session.
 */
export async function requirePrivileged(request: FastifyRequest, reply: FastifyReply) {
  if (!request.resolvedUser) {
    return reply.status(401).send({ error: "NOT_AUTHENTICATED", message: "Authentication required" });
  }

  // Admin wallets are always privileged
  const address = request.resolvedUser.walletAddress.toLowerCase();
  if (config.adminWallets.includes(address)) {
    return;
  }

  // Bot service key is privileged
  if (request.resolvedUser.source === "discord") {
    return;
  }

  return reply.status(403).send({ error: "INSUFFICIENT_PERMISSIONS", message: "Admin or service key required" });
}

import Fastify from "fastify";
import corsPlugin from "./plugins/cors.js";
import sessionPlugin from "./plugins/session.js";
import prismaPlugin from "./plugins/prisma.js";
import rateLimitPlugin from "./plugins/rate-limit.js";
import { connectRedis, redis } from "./lib/redis.js";
import { shutdownQueues } from "./lib/queue.js";
import { startRenderWorker } from "./workers/render-worker.js";
import { startCrateWorker } from "./workers/crate-worker.js";
import authRoutes from "./routes/auth/index.js";
import userRoutes from "./routes/users/index.js";
import cubRoutes from "./routes/cubs/index.js";
import traitRoutes from "./routes/traits/index.js";
import marketplaceRoutes from "./routes/marketplace/index.js";
import traitRegistryRoutes from "./routes/trait-registry/index.js";
import userTraitRoutes from "./routes/user-traits/index.js";
import editorRoutes from "./routes/editor/index.js";
import crateRoutes from "./routes/crates/index.js";
import pawsRoutes from "./routes/paws/index.js";
import stakingRoutes from "./routes/staking/index.js";
import forgeRoutes from "./routes/forge/index.js";
import adminRoutes from "./routes/admin/index.js";
import dropRoutes from "./routes/drops/index.js";
import "./services/economy-stats-service.js"; // register event listeners for daily stats

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    },
  });

  // Plugins
  await fastify.register(corsPlugin);
  await fastify.register(sessionPlugin);
  await fastify.register(prismaPlugin);
  await fastify.register(rateLimitPlugin);

  // Routes
  await fastify.register(authRoutes, { prefix: "/api/auth" });
  await fastify.register(userRoutes, { prefix: "/api/users" });
  await fastify.register(cubRoutes, { prefix: "/api/cubs" });
  await fastify.register(traitRoutes, { prefix: "/api/traits" });
  await fastify.register(marketplaceRoutes, { prefix: "/api/marketplace" });
  await fastify.register(traitRegistryRoutes, { prefix: "/api/trait-registry" });
  await fastify.register(userTraitRoutes, { prefix: "/api/user-traits" });
  await fastify.register(editorRoutes, { prefix: "/api/editor" });
  await fastify.register(crateRoutes, { prefix: "/api/crates" });
  await fastify.register(pawsRoutes, { prefix: "/api/paws" });
  await fastify.register(stakingRoutes, { prefix: "/api/staking" });
  await fastify.register(forgeRoutes, { prefix: "/api/forge" });
  await fastify.register(adminRoutes, { prefix: "/api/admin" });
  await fastify.register(dropRoutes, { prefix: "/api/drops" });

  // Health check
  fastify.get("/api/health", async () => ({ status: "ok" }));

  // Redis connection (non-blocking — caching degrades gracefully)
  connectRedis().catch(() => {});

  // Start queue workers (co-located with API in dev; separate process in prod)
  startRenderWorker();
  startCrateWorker();

  // Graceful shutdown
  fastify.addHook("onClose", async () => {
    await shutdownQueues();
    await redis.quit().catch(() => {});
  });

  return fastify;
}

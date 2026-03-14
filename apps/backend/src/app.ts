import Fastify from "fastify";
import corsPlugin from "./plugins/cors.js";
import sessionPlugin from "./plugins/session.js";
import prismaPlugin from "./plugins/prisma.js";
import authRoutes from "./routes/auth/index.js";
import userRoutes from "./routes/users/index.js";
import cubRoutes from "./routes/cubs/index.js";
import traitRoutes from "./routes/traits/index.js";
import marketplaceRoutes from "./routes/marketplace/index.js";
import traitRegistryRoutes from "./routes/trait-registry/index.js";
import userTraitRoutes from "./routes/user-traits/index.js";
import editorRoutes from "./routes/editor/index.js";

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

  // Routes
  await fastify.register(authRoutes, { prefix: "/api/auth" });
  await fastify.register(userRoutes, { prefix: "/api/users" });
  await fastify.register(cubRoutes, { prefix: "/api/cubs" });
  await fastify.register(traitRoutes, { prefix: "/api/traits" });
  await fastify.register(marketplaceRoutes, { prefix: "/api/marketplace" });
  await fastify.register(traitRegistryRoutes, { prefix: "/api/trait-registry" });
  await fastify.register(userTraitRoutes, { prefix: "/api/user-traits" });
  await fastify.register(editorRoutes, { prefix: "/api/editor" });

  // Health check
  fastify.get("/api/health", async () => ({ status: "ok" }));

  return fastify;
}

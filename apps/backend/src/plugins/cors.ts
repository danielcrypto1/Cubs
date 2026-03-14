import fp from "fastify-plugin";
import cors from "@fastify/cors";
import { config } from "../lib/config.js";

export default fp(async (fastify) => {
  await fastify.register(cors, {
    origin: config.FRONTEND_URL,
    credentials: true,
  });
});

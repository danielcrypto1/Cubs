import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import { config } from "../lib/config.js";

export default fp(async (fastify) => {
  await fastify.register(cookie);
  await fastify.register(session, {
    secret: config.SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    // TODO: Use connect-pg-simple or Redis store for production
  });
});

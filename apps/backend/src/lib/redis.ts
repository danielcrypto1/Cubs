import Redis from "ioredis";
import { config } from "./config.js";

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
    console.log("Redis connected");
  } catch {
    console.warn("Redis connection failed — caching disabled");
  }
}

export function isRedisReady(): boolean {
  return redis.status === "ready";
}

import { redis, isRedisReady } from "../lib/redis.js";
import crypto from "node:crypto";

const CACHE_PREFIX = "marketplace:";

export async function getOrSetCached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  if (!isRedisReady()) {
    return fetcher();
  }

  const fullKey = CACHE_PREFIX + key;

  try {
    const cached = await redis.get(fullKey);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch {
    // Cache read failed, fall through to fetcher
  }

  const result = await fetcher();

  try {
    await redis.set(fullKey, JSON.stringify(result), "EX", ttlSeconds);
  } catch {
    // Cache write failed, non-critical
  }

  return result;
}

export async function invalidateMarketplaceCache(): Promise<void> {
  if (!isRedisReady()) return;

  try {
    const keys = await redis.keys(CACHE_PREFIX + "*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Cache invalidation failed, non-critical
  }
}

export function buildCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sorted = JSON.stringify(params, Object.keys(params).sort());
  const hash = crypto.createHash("md5").update(sorted).digest("hex").slice(0, 12);
  return `${prefix}:${hash}`;
}

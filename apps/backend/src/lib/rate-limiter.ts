import { redis, isRedisReady } from "./redis.js";

// ─── Redis Sliding Window Rate Limiter ─────────────────
//
// Uses Redis INCR + EXPIRE for per-user rate limiting.
// Degrades gracefully: if Redis is unavailable, the check
// is skipped (fail-open). This prevents rate-limit logic
// from blocking the system when Redis is down, while still
// providing protection under normal operation.
// ─────────────────────────────────────────────────────────

export class RateLimitError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryAfter: number, // seconds
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Checks and increments a rate limit counter in Redis.
 *
 * @param key         - rate limit key (e.g. "crate_open:{userId}")
 * @param maxRequests - maximum allowed in the window
 * @param windowSec   - sliding window in seconds
 * @throws RateLimitError if limit exceeded
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSec: number,
): Promise<void> {
  if (!isRedisReady()) {
    // Fail-open: if Redis is down, don't block the request.
    // Intent protection + advisory locks remain as the safety net.
    return;
  }

  try {
    const fullKey = `rate:${key}`;

    // INCR atomically creates or increments the counter
    const count = await redis.incr(fullKey);

    // Set expiry only on the first increment (when counter is 1)
    if (count === 1) {
      await redis.expire(fullKey, windowSec);
    }

    if (count > maxRequests) {
      // Get the remaining TTL for the retry-after header
      const ttl = await redis.ttl(fullKey);
      throw new RateLimitError(
        "RATE_LIMITED",
        `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSec}s.`,
        Math.max(ttl, 1),
      );
    }
  } catch (err) {
    // Re-throw RateLimitError, swallow Redis connection errors
    if (err instanceof RateLimitError) throw err;
    // Redis error — fail-open
    console.warn("Rate limiter Redis error (fail-open):", err);
  }
}

import { Queue, Worker, type ConnectionOptions, type Job } from "bullmq";
import { config } from "./config.js";
import type { RenderJobData, RenderJobResult, CrateJobData, CrateJobResult } from "@cubs/shared";

// ─── Connection ─────────────────────────────────────────

function parseRedisUrl(url: string): ConnectionOptions {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || "6379", 10),
    password: parsed.password || undefined,
    db: parsed.pathname ? parseInt(parsed.pathname.slice(1), 10) || 0 : 0,
  };
}

const connection: ConnectionOptions = parseRedisUrl(config.REDIS_URL);

// ─── Queue Names ────────────────────────────────────────

export const QUEUE_NAMES = {
  RENDER: "cubs:render",
  CRATE: "cubs:crate",
} as const;

// ─── Queues ─────────────────────────────────────────────

export const renderQueue = new Queue<RenderJobData, RenderJobResult>(QUEUE_NAMES.RENDER, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 86400, count: 5000 },
  },
});

export const crateQueue = new Queue<CrateJobData, CrateJobResult>(QUEUE_NAMES.CRATE, {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "fixed", delay: 1000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 86400, count: 5000 },
  },
});

// ─── Worker Factory ─────────────────────────────────────

// Workers are created separately so they can be started/stopped independently.
// In production, workers may run in a separate process.

export function createRenderWorker(
  processor: (job: Job<RenderJobData>) => Promise<RenderJobResult>,
) {
  return new Worker<RenderJobData, RenderJobResult>(QUEUE_NAMES.RENDER, processor, {
    connection,
    concurrency: 2,
    limiter: { max: 5, duration: 10_000 },
  });
}

export function createCrateWorker(
  processor: (job: Job<CrateJobData>) => Promise<CrateJobResult>,
) {
  return new Worker<CrateJobData, CrateJobResult>(QUEUE_NAMES.CRATE, processor, {
    connection,
    concurrency: 5,
    limiter: { max: 20, duration: 10_000 },
  });
}

// ─── Graceful Shutdown ──────────────────────────────────

const allQueues = [renderQueue, crateQueue];
const activeWorkers: Worker[] = [];

export function registerWorker(worker: Worker) {
  activeWorkers.push(worker);
}

export async function shutdownQueues() {
  await Promise.all([
    ...activeWorkers.map((w) => w.close()),
    ...allQueues.map((q) => q.close()),
  ]);
}

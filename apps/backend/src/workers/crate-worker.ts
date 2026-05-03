import type { Job } from "bullmq";
import type { CrateJobData, CrateJobResult } from "@cubs/shared";
import { createCrateWorker, registerWorker } from "../lib/queue.js";

/**
 * Crate worker — processes crate opening jobs asynchronously.
 *
 * Pipeline:
 *   1. Validate crate ownership + decrement quantity
 *   2. Select reward using loot engine (CrateReward table)
 *   3. Distribute reward:
 *      - TRAIT: mint trait to user inventory, increment supply (atomic)
 *      - PAWS: credit via paws-service ledger
 *      - CUB: mint new cub (future)
 *      - NFT: external grant (future)
 *   4. Return result for client display
 *
 * NOT YET IMPLEMENTED — this is the structural stub.
 * Full implementation will be added in Phase B.
 */
async function processCrateJob(job: Job<CrateJobData>): Promise<CrateJobResult> {
  const { crateOpenId } = job.data;

  await job.updateProgress(10);

  // TODO Phase B: full crate opening pipeline
  // 1. select reward from CrateReward table (weighted random)
  // 2. distribute reward by type
  // 3. log PAWS transaction if PAWS reward
  // 4. check badge triggers

  await job.updateProgress(100);

  // Placeholder return — will be replaced with real implementation
  return {
    crateOpenId,
    reward: {
      rewardType: "TRAIT",
    },
    remainingCrates: 0,
  };
}

export function startCrateWorker() {
  const worker = createCrateWorker(processCrateJob);

  worker.on("completed", (job) => {
    job?.data && console.log(`Crate job completed: id=${job.data.crateOpenId}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Crate job failed: id=${job?.data.crateOpenId}`, err.message);
  });

  registerWorker(worker);
  return worker;
}

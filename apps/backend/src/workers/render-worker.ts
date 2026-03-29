import type { Job } from "bullmq";
import type { RenderJobData, RenderJobResult } from "@cubs/shared";
import { createRenderWorker, registerWorker } from "../lib/queue.js";
import { generateCompositeImage } from "../lib/image-composer.js";
import { uploadImageToIpfs, uploadJsonToIpfs } from "../lib/ipfs.js";
import { prisma } from "../lib/prisma.js";
import { economyEvents } from "../lib/economy-events.js";

// ─── Render Worker ────────────────────────────────────
//
// Processes cub image composition jobs asynchronously.
//
// Pipeline:
//   1. Fetch trait images for all equipped layers
//   2. Composite layers using Sharp
//   3. Upload result to IPFS (Pinata)
//   4. Generate + upload ERC-721 metadata JSON
//   5. Update cub record with new image + metadata URIs
//
// Jobs are idempotent: re-running produces the same result.
// Retries are handled by BullMQ (3 attempts, exponential backoff).
// ─────────────────────────────────────────────────────────

async function processRenderJob(job: Job<RenderJobData>): Promise<RenderJobResult> {
  const { cubId, version, layers, requestedBy } = job.data;

  await job.updateProgress(10);

  // 1. Load cub for metadata
  const cub = await prisma.cub.findUniqueOrThrow({
    where: { id: cubId },
    select: { tokenId: true, name: true, description: true },
  });

  await job.updateProgress(20);

  // 2. Composite layers using Sharp
  const imageLayerInputs = layers.map((l) => ({
    category: l.slotCategory,
    imageUrl: l.imageUrl,
  }));

  const compositeBuffer = await generateCompositeImage(imageLayerInputs);
  await job.updateProgress(50);

  // 3. Upload composite image to IPFS
  const imageUri = await uploadImageToIpfs(compositeBuffer, `cub-${cub.tokenId}-v${version}.png`);
  const imageHttpUrl = imageUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  await job.updateProgress(70);

  // 4. Build + upload ERC-721 metadata JSON
  const metadata = {
    name: cub.name || `Cub #${cub.tokenId}`,
    description: cub.description || `CUBS NFT #${cub.tokenId}`,
    image: imageUri,
    attributes: layers.map((l) => ({
      trait_type: l.slotCategory,
      value: l.traitDefinitionId,
    })),
  };
  const metadataUri = await uploadJsonToIpfs(metadata, `cub-${cub.tokenId}-v${version}-metadata`);
  await job.updateProgress(85);

  // 5. Update cub record + CubVersion with rendered URIs
  await prisma.$transaction(async (tx) => {
    await tx.cub.update({
      where: { id: cubId },
      data: {
        imageUrl: imageHttpUrl,
        metadataUri,
      },
    });

    // Update the CubVersion snapshot with rendered image
    await tx.cubVersion.updateMany({
      where: { cubId, version },
      data: {
        imageUrl: imageHttpUrl,
        metadataUri,
      },
    });
  });

  await job.updateProgress(100);

  // Emit render_completed event (fire-and-forget)
  economyEvents.emit("render_completed", {
    userId: requestedBy,
    data: { cubId, version, imageUrl: imageHttpUrl, metadataUri },
  });

  return {
    cubId,
    version,
    imageUrl: imageHttpUrl,
    metadataUri,
  };
}

export function startRenderWorker() {
  const worker = createRenderWorker(processRenderJob);

  worker.on("completed", (job) => {
    job?.data && console.log(`Render completed: cub=${job.data.cubId} v${job.data.version}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Render failed: cub=${job?.data.cubId} v${job?.data.version}`, err.message);
  });

  registerWorker(worker);
  return worker;
}

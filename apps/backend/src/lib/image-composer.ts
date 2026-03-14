import sharp from "sharp";
import { TRAIT_LAYER_ORDER } from "@cubs/shared";
import type { TraitCategory } from "@cubs/shared";

const CANVAS_SIZE = 1024;

interface LayerInput {
  category: TraitCategory;
  imageUrl: string;
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${url} (${res.status})`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function generateCompositeImage(layers: LayerInput[]): Promise<Buffer> {
  // Sort layers by the canonical layer order
  const sorted = [...layers].sort(
    (a, b) => TRAIT_LAYER_ORDER.indexOf(a.category) - TRAIT_LAYER_ORDER.indexOf(b.category),
  );

  // Fetch all layer images in parallel
  const buffers = await Promise.all(
    sorted.map(async (layer) => ({
      input: await fetchImageBuffer(layer.imageUrl),
    })),
  );

  // Create base canvas and composite all layers
  const base = sharp({
    create: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).png();

  if (buffers.length === 0) {
    return base.toBuffer();
  }

  // Resize each layer to canvas size and composite
  const resizedInputs = await Promise.all(
    buffers.map(async (buf) => ({
      input: await sharp(buf.input).resize(CANVAS_SIZE, CANVAS_SIZE, { fit: "contain" }).png().toBuffer(),
    })),
  );

  return sharp({
    create: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(resizedInputs)
    .png()
    .toBuffer();
}

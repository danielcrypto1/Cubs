"use client";

import { useRef, useEffect } from "react";
import type { EditorLayerConfig } from "@/types";
import { TRAIT_LAYER_ORDER } from "@/lib/constants";

const CANVAS_SIZE = 1024;
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached?.complete) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

interface EditorCanvasProps {
  layers: EditorLayerConfig[];
}

export function EditorCanvas({ layers }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;

    async function render() {
      ctx!.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw checkerboard pattern for transparency
      const tileSize = 32;
      for (let y = 0; y < CANVAS_SIZE; y += tileSize) {
        for (let x = 0; x < CANVAS_SIZE; x += tileSize) {
          const isLight = ((x / tileSize + y / tileSize) % 2) === 0;
          ctx!.fillStyle = isLight ? "#1a1a2e" : "#16162a";
          ctx!.fillRect(x, y, tileSize, tileSize);
        }
      }

      // Sort layers by canonical order and draw
      const sorted = [...layers]
        .filter((l) => l.imageUrl)
        .sort(
          (a, b) =>
            TRAIT_LAYER_ORDER.indexOf(a.category) -
            TRAIT_LAYER_ORDER.indexOf(b.category),
        );

      for (const layer of sorted) {
        if (cancelled || !layer.imageUrl) continue;
        try {
          const img = await loadImage(layer.imageUrl);
          if (!cancelled) {
            ctx!.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
          }
        } catch {
          // Skip layers that fail to load
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [layers]);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-background">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="h-full w-full"
      />
    </div>
  );
}

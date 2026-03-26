"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import type { MediaKitLayer, GradientConfig } from "@/types";

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

export interface EditorCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

interface EditorCanvasProps {
  layers: MediaKitLayer[];
  canvasWidth: number;
  canvasHeight: number;
  selectedLayerId?: string | null;
}

export const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(
  function EditorCanvas({ layers, canvasWidth, canvasHeight, selectedLayerId }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let cancelled = false;

      async function render() {
        ctx!.clearRect(0, 0, canvasWidth, canvasHeight);

        // Sort layers by zIndex
        const sorted = [...layers]
          .filter((l) => l.visible)
          .sort((a, b) => a.zIndex - b.zIndex);

        for (const layer of sorted) {
          if (cancelled) return;

          switch (layer.type) {
            case "background":
              drawBackground(ctx!, layer, canvasWidth, canvasHeight);
              break;
            case "nft":
            case "overlay":
            case "image":
              await drawImageLayer(ctx!, layer, cancelled);
              break;
            case "text":
              drawTextLayer(ctx!, layer);
              break;
          }
        }

        // Draw selection highlight
        if (!cancelled && selectedLayerId) {
          const sel = sorted.find((l) => l.id === selectedLayerId);
          if (sel && sel.type !== "background") {
            drawSelection(ctx!, sel);
          }
        }
      }

      render();

      return () => {
        cancelled = true;
      };
    }, [layers, canvasWidth, canvasHeight, selectedLayerId]);

    return (
      <div className="cubs-leopard-border relative overflow-hidden rounded-2xl p-2">
        <div
          className="relative overflow-hidden rounded-xl border border-border bg-background shadow-lg"
          style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="h-full w-full"
          />
        </div>
      </div>
    );
  },
);

// ── Background rendering ──────────────────────────────────────────────

function drawBackground(
  ctx: CanvasRenderingContext2D,
  layer: MediaKitLayer,
  w: number,
  h: number,
) {
  if (layer.gradient) {
    drawGradient(ctx, layer.gradient, w, h);
  } else if (layer.pattern) {
    drawPattern(ctx, layer.pattern, w, h);
  } else if (layer.backgroundColor) {
    ctx.fillStyle = layer.backgroundColor;
    ctx.fillRect(0, 0, w, h);
  } else {
    drawCheckerboard(ctx, w, h);
  }
}

function drawGradient(
  ctx: CanvasRenderingContext2D,
  config: GradientConfig,
  w: number,
  h: number,
) {
  const angle = (config.angle * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  const len = Math.max(w, h);

  let grad: CanvasGradient;
  if (config.type === "radial") {
    grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, len / 2);
  } else {
    const dx = Math.cos(angle) * len;
    const dy = Math.sin(angle) * len;
    grad = ctx.createLinearGradient(cx - dx / 2, cy - dy / 2, cx + dx / 2, cy + dy / 2);
  }

  for (const stop of config.stops) {
    grad.addColorStop(stop.position, stop.color);
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  pattern: string,
  w: number,
  h: number,
) {
  switch (pattern) {
    case "leopard":
      drawLeopardPattern(ctx, w, h);
      break;
    case "checkerboard":
      drawCheckerboard(ctx, w, h);
      break;
    case "dots":
      drawDotsPattern(ctx, w, h);
      break;
    case "stripes":
      drawStripesPattern(ctx, w, h);
      break;
    default:
      drawCheckerboard(ctx, w, h);
  }
}

function drawCheckerboard(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const tileSize = 32;
  for (let y = 0; y < h; y += tileSize) {
    for (let x = 0; x < w; x += tileSize) {
      const isLight = ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2) === 0;
      ctx.fillStyle = isLight ? "#1a1a2e" : "#16162a";
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }
}

function drawLeopardPattern(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Dark teal base
  ctx.fillStyle = "#134e4a";
  ctx.fillRect(0, 0, w, h);

  // Leopard spots using seeded pseudo-random positions
  const spotCount = Math.floor((w * h) / 3000);
  const colors = ["#0d3d38", "#1a6b63", "#5eead4"];

  for (let i = 0; i < spotCount; i++) {
    // Simple hash for deterministic placement
    const px = ((i * 7919 + 104729) % w);
    const py = ((i * 6271 + 87491) % h);
    const size = 8 + (i % 20);
    const colorIdx = i % colors.length;

    ctx.beginPath();
    ctx.ellipse(px, py, size, size * 0.75, (i * 0.5) % Math.PI, 0, Math.PI * 2);
    ctx.fillStyle = colors[colorIdx];
    ctx.fill();

    // Dark ring
    if (i % 3 !== 0) {
      ctx.strokeStyle = "#0a2e2a";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

function drawDotsPattern(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, w, h);

  const spacing = 30;
  ctx.fillStyle = "#475569";
  for (let y = spacing / 2; y < h; y += spacing) {
    for (let x = spacing / 2; x < w; x += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawStripesPattern(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 4;
  const spacing = 20;
  for (let i = -h; i < w + h; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h, h);
    ctx.stroke();
  }
}

// ── Image layer rendering ─────────────────────────────────────────────

async function drawImageLayer(
  ctx: CanvasRenderingContext2D,
  layer: MediaKitLayer,
  cancelled: boolean,
) {
  if (!layer.imageUrl || cancelled) return;

  try {
    const img = await loadImage(layer.imageUrl);
    if (cancelled) return;

    ctx.save();
    if (layer.rotation) {
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.drawImage(img, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
    } else {
      ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
    }
    ctx.restore();
  } catch {
    // Skip failed images
  }
}

// ── Text layer rendering ──────────────────────────────────────────────

function drawTextLayer(ctx: CanvasRenderingContext2D, layer: MediaKitLayer) {
  if (!layer.text) return;

  ctx.save();

  const fontSize = layer.fontSize ?? 48;
  const fontFamily = layer.fontFamily ?? "Nunito";
  ctx.font = `bold ${fontSize}px ${fontFamily}, sans-serif`;
  ctx.fillStyle = layer.fontColor ?? "#ffffff";
  ctx.textBaseline = "top";

  if (layer.rotation) {
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.fillText(layer.text, -layer.width / 2, -layer.height / 2);
  } else {
    ctx.fillText(layer.text, layer.x, layer.y);
  }

  ctx.restore();
}

// ── Selection highlight ───────────────────────────────────────────────

function drawSelection(ctx: CanvasRenderingContext2D, layer: MediaKitLayer) {
  ctx.save();
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 4]);

  if (layer.rotation) {
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.strokeRect(-layer.width / 2 - 2, -layer.height / 2 - 2, layer.width + 4, layer.height + 4);
  } else {
    ctx.strokeRect(layer.x - 2, layer.y - 2, layer.width + 4, layer.height + 4);
  }

  ctx.restore();
}

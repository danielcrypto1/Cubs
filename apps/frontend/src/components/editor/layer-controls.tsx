"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Eye, EyeOff } from "lucide-react";
import type { MediaKitLayer } from "@/types";

interface LayerControlsProps {
  layer: MediaKitLayer;
  canvasWidth: number;
  canvasHeight: number;
  onUpdate: (id: string, partial: Partial<MediaKitLayer>) => void;
  onRemove: (id: string) => void;
}

export function LayerControls({
  layer,
  canvasWidth,
  canvasHeight,
  onUpdate,
  onRemove,
}: LayerControlsProps) {
  if (layer.type === "background") return null;

  const scale = Math.round(
    (layer.width / (layer.type === "text" ? canvasWidth * 0.8 : Math.min(canvasWidth, canvasHeight) * 0.8)) * 100,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          NFT Position
        </h3>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onUpdate(layer.id, { visible: !layer.visible })}
          >
            {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={() => onRemove(layer.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* X Position */}
      <SliderRow
        label="X"
        value={layer.x}
        min={-layer.width}
        max={canvasWidth}
        onChange={(v) => onUpdate(layer.id, { x: v })}
      />

      {/* Y Position */}
      <SliderRow
        label="Y"
        value={layer.y}
        min={-layer.height}
        max={canvasHeight}
        onChange={(v) => onUpdate(layer.id, { y: v })}
      />

      {/* Scale */}
      <SliderRow
        label="Scale"
        value={scale}
        min={10}
        max={200}
        suffix="%"
        onChange={(v) => {
          const ratio = layer.height / (layer.width || 1);
          const baseSize = layer.type === "text" ? canvasWidth * 0.8 : Math.min(canvasWidth, canvasHeight) * 0.8;
          const newWidth = Math.round((v / 100) * baseSize);
          const newHeight = Math.round(newWidth * ratio);
          onUpdate(layer.id, { width: newWidth, height: newHeight });
        }}
      />

      {/* Rotation */}
      <SliderRow
        label="Rotate"
        value={layer.rotation}
        min={0}
        max={360}
        suffix="°"
        onChange={(v) => onUpdate(layer.id, { rotation: v })}
      />
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-medium">
          {Math.round(value)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={Math.round(value)}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

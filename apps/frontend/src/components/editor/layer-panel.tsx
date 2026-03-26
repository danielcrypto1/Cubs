"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Trash2,
  Image as ImageIcon,
  Type,
  Layers,
  PaintBucket,
} from "lucide-react";
import { springGentle } from "@/lib/animations";
import type { MediaKitLayer } from "@/types";

interface LayerPanelProps {
  layers: MediaKitLayer[];
  selectedLayerId: string | null;
  onSelect: (id: string | null) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
  onUpdate: (id: string, partial: Partial<MediaKitLayer>) => void;
  onRemove: (id: string) => void;
}

const LAYER_ICONS: Record<string, React.ElementType> = {
  background: PaintBucket,
  nft: ImageIcon,
  overlay: Layers,
  text: Type,
  image: ImageIcon,
};

function getLayerLabel(layer: MediaKitLayer): string {
  switch (layer.type) {
    case "background":
      return "Background";
    case "nft":
      return "NFT";
    case "text":
      return layer.text?.slice(0, 16) ?? "Text";
    case "overlay":
      return "Overlay";
    case "image":
      return "Image";
    default:
      return "Layer";
  }
}

export function LayerPanel({
  layers,
  selectedLayerId,
  onSelect,
  onReorder,
  onUpdate,
  onRemove,
}: LayerPanelProps) {
  const sorted = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Layers
      </h3>

      <div className="space-y-1">
        <AnimatePresence initial={false}>
        {sorted.map((layer) => {
          const Icon = LAYER_ICONS[layer.type] ?? Layers;
          const isSelected = selectedLayerId === layer.id;
          const isBg = layer.type === "background";

          return (
            <motion.div
              key={layer.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, height: 0 }}
              transition={springGentle}
              onClick={() => onSelect(isBg ? null : layer.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                isSelected
                  ? "bg-primary/10 border border-primary/30"
                  : "border border-transparent hover:bg-muted/50"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span
                className={`flex-1 truncate ${!layer.visible ? "text-muted-foreground/50 line-through" : ""}`}
              >
                {getLayerLabel(layer)}
              </span>

              {!isBg && (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorder(layer.id, "up");
                    }}
                    className="rounded p-0.5 hover:bg-muted"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorder(layer.id, "down");
                    }}
                    className="rounded p-0.5 hover:bg-muted"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(layer.id, { visible: !layer.visible });
                    }}
                    className="rounded p-0.5 hover:bg-muted"
                  >
                    {layer.visible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground/50" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(layer.id);
                    }}
                    className="rounded p-0.5 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
    </div>
  );
}

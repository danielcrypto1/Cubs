"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getTraitImagePath } from "@/lib/trait-registry";

interface LayerPreviewProps {
  selections: Record<string, string>;
  cubType: "regular" | "onsie" | "oneofone";
  layerOrder: string[];
}

/**
 * Live canvas-style preview that composites all selected trait layers
 * in the correct render order.
 */
export function LayerPreview({ selections, cubType, layerOrder }: LayerPreviewProps) {
  const isOnsie = cubType === "onsie";

  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10"
      style={{
        backgroundImage:
          "repeating-conic-gradient(#1a1a2e 0% 25%, #12121e 0% 50%)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Layer stack */}
      <AnimatePresence mode="popLayout">
        {layerOrder.map((category) => {
          const traitName = selections[category];
          if (!traitName || traitName === "None") return null;

          const imagePath = getTraitImagePath(category, traitName, isOnsie);

          return (
            <motion.img
              key={`${category}-${traitName}`}
              src={imagePath}
              alt={`${category}: ${traitName}`}
              className="absolute inset-0 h-full w-full object-contain"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              loading="eager"
            />
          );
        })}
      </AnimatePresence>

      {/* Empty state */}
      {layerOrder.every((c) => !selections[c] || selections[c] === "None") && (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <p className="text-sm">Select traits to preview your Cub</p>
        </div>
      )}
    </div>
  );
}

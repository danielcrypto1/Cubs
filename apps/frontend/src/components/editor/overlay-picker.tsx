"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MOCK_OVERLAYS } from "@/lib/media-kit-data";
import { staggerContainer, staggerItem, springBouncy } from "@/lib/animations";

interface OverlayPickerProps {
  onAdd: (overlayId: string) => void;
}

export function OverlayPicker({ onAdd }: OverlayPickerProps) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Add Layer
      </h3>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-2"
      >
        {MOCK_OVERLAYS.map((overlay) => (
          <motion.button
            key={overlay.id}
            variants={staggerItem}
            whileHover={{ scale: 1.05, transition: springBouncy }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAdd(overlay.id)}
            className="group overflow-hidden rounded-lg border border-border transition-all hover:border-primary/50"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={overlay.thumbnailUrl}
                alt={overlay.name}
                fill
                unoptimized
                className="object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <p className="truncate px-1 py-0.5 text-[9px] font-medium text-muted-foreground">
              {overlay.name}
            </p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

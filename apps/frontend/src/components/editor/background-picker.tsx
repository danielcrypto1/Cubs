"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MOCK_BACKGROUNDS } from "@/lib/media-kit-data";
import { staggerContainer, staggerItem, springBouncy } from "@/lib/animations";

interface BackgroundPickerProps {
  onSelect: (presetId: string) => void;
}

export function BackgroundPicker({ onSelect }: BackgroundPickerProps) {
  const solids = MOCK_BACKGROUNDS.filter((b) => b.type === "solid");
  const gradients = MOCK_BACKGROUNDS.filter((b) => b.type === "gradient");
  const patterns = MOCK_BACKGROUNDS.filter((b) => b.type === "pattern");

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Background
      </h3>

      {/* Solid Colors */}
      <div>
        <p className="mb-1.5 text-[10px] font-medium text-muted-foreground">Solid</p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap gap-2"
        >
          {solids.map((bg) => (
            <motion.button
              key={bg.id}
              variants={staggerItem}
              whileHover={{ scale: 1.2, transition: springBouncy }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(bg.id)}
              className="h-8 w-8 rounded-lg border border-border transition-all hover:ring-2 hover:ring-primary/50"
              style={{ backgroundColor: bg.value }}
              title={bg.name}
            />
          ))}
        </motion.div>
      </div>

      {/* Gradients */}
      <div>
        <p className="mb-1.5 text-[10px] font-medium text-muted-foreground">Gradient</p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap gap-2"
        >
          {gradients.map((bg) => (
            <motion.button
              key={bg.id}
              variants={staggerItem}
              whileHover={{ scale: 1.15, transition: springBouncy }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(bg.id)}
              className="h-8 w-14 rounded-lg border border-border transition-all hover:ring-2 hover:ring-primary/50"
              style={{ background: bg.value }}
              title={bg.name}
            />
          ))}
        </motion.div>
      </div>

      {/* Patterns */}
      <div>
        <p className="mb-1.5 text-[10px] font-medium text-muted-foreground">Pattern</p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 gap-2"
        >
          {patterns.map((bg) => (
            <motion.button
              key={bg.id}
              variants={staggerItem}
              whileHover={{ scale: 1.08, transition: springBouncy }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(bg.id)}
              className="overflow-hidden rounded-lg border border-border transition-all hover:ring-2 hover:ring-primary/50"
            >
              {bg.thumbnailUrl ? (
                <div className="relative aspect-square">
                  <Image
                    src={bg.thumbnailUrl}
                    alt={bg.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center bg-muted text-[9px]">
                  {bg.name}
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

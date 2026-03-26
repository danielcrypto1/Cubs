"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MOCK_CUBS } from "@/lib/mock-data";
import { staggerContainer, staggerItem, springBouncy } from "@/lib/animations";

interface NftPickerProps {
  selectedCubId: string | null;
  onSelect: (cubId: string) => void;
}

export function NftPicker({ selectedCubId, onSelect }: NftPickerProps) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Select NFT
      </h3>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-2"
      >
        {MOCK_CUBS.map((cub) => (
          <motion.button
            key={cub.id}
            variants={staggerItem}
            whileHover={{ y: -2, transition: springBouncy }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(cub.id)}
            className={`group overflow-hidden rounded-lg border transition-all ${
              selectedCubId === cub.id
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={cub.imageUrl}
                alt={cub.name}
                fill
                unoptimized
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <p className="truncate px-1.5 py-1 text-[10px] font-semibold">{cub.name}</p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

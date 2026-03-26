"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import sampleCubs from "@/data/sample-cubs.json";

interface CubData {
  tokenId: number;
  name: string;
  type: "regular" | "onsie" | "oneofone";
  imageUrl: string;
  attributes: { trait_type: string; value: string }[];
}

interface CubSelectorProps {
  selectedId: number | null;
  onSelect: (cub: CubData) => void;
}

const cubs = sampleCubs as CubData[];

export function CubSelector({ selectedId, onSelect }: CubSelectorProps) {
  // Filter out 1-of-1s since they can't be edited
  const editableCubs = cubs.filter((c) => c.type !== "oneofone");

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">
        Select a Cub from your wallet ({editableCubs.length} editable)
      </h3>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4">
        {editableCubs.map((cub) => {
          const isSelected = selectedId === cub.tokenId;
          return (
            <motion.button
              key={cub.tokenId}
              onClick={() => onSelect(cub)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative overflow-hidden rounded-xl border-2 transition-all",
                isSelected
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-white/10 hover:border-white/20",
              )}
            >
              <div className="aspect-square bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cub.imageUrl}
                  alt={cub.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-1.5 text-center">
                <span className="text-[10px] font-medium">#{cub.tokenId}</span>
                {cub.type === "onsie" && (
                  <Badge variant="outline" className="ml-1 px-1 py-0 text-[8px]">
                    Onsie
                  </Badge>
                )}
              </div>
              {isSelected && (
                <motion.div
                  layoutId="cub-selected"
                  className="absolute inset-0 rounded-xl border-2 border-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export type { CubData };

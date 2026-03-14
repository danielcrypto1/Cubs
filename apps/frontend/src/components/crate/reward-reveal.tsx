"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { CrateOpenResult } from "@/types";

const RARITY_GLOW: Record<string, string> = {
  COMMON: "shadow-zinc-400/50",
  UNCOMMON: "shadow-green-400/50",
  RARE: "shadow-blue-400/50",
  EPIC: "shadow-purple-400/50",
  LEGENDARY: "shadow-amber-400/50",
};

const RARITY_COLORS: Record<string, string> = {
  COMMON: "bg-zinc-600",
  UNCOMMON: "bg-green-600",
  RARE: "bg-blue-600",
  EPIC: "bg-purple-600",
  LEGENDARY: "bg-amber-500",
};

interface RewardRevealProps {
  result: CrateOpenResult;
}

export function RewardReveal({ result }: RewardRevealProps) {
  const { traitDefinition, rarity } = result.reward;
  const glow = RARITY_GLOW[rarity] ?? "";

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="flex flex-col items-center gap-4"
    >
      <div className={`relative h-48 w-48 overflow-hidden rounded-xl shadow-2xl ${glow}`}>
        <Image
          src={traitDefinition.imageUrl}
          alt={traitDefinition.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold">{traitDefinition.name}</h3>
        <div className="mt-1 flex items-center justify-center gap-2">
          <Badge
            className={`${RARITY_COLORS[rarity] ?? ""} px-2 py-0.5 text-xs text-white`}
          >
            {rarity}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {traitDefinition.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

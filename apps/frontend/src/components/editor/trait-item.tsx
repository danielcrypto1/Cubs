"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { TraitDefinition } from "@/types";

const RARITY_VARIANTS: Record<string, "common" | "uncommon" | "rare" | "epic" | "legendary"> = {
  COMMON: "common",
  UNCOMMON: "uncommon",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
};

interface TraitItemProps {
  trait: TraitDefinition;
  quantity: number;
  isActive?: boolean;
  onClick: () => void;
}

export function TraitItem({ trait, quantity, isActive, onClick }: TraitItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg border p-2 text-left transition-colors hover:border-primary/50 ${
        isActive ? "border-primary bg-primary/10" : "border-border"
      }`}
    >
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={trait.imageUrl}
          alt={trait.name}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{trait.name}</p>
        <div className="flex items-center gap-1.5">
          <Badge variant={RARITY_VARIANTS[trait.rarity] ?? "common"} className="text-[10px]">
            {trait.rarity}
          </Badge>
          <span className="text-xs text-muted-foreground">x{quantity}</span>
        </div>
      </div>
    </button>
  );
}

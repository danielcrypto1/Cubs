"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { TraitDefinition } from "@/types";

const RARITY_COLORS: Record<string, string> = {
  COMMON: "bg-zinc-600",
  UNCOMMON: "bg-green-600",
  RARE: "bg-blue-600",
  EPIC: "bg-purple-600",
  LEGENDARY: "bg-amber-500",
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
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{trait.name}</p>
        <div className="flex items-center gap-1.5">
          <Badge
            className={`${RARITY_COLORS[trait.rarity] ?? ""} px-1.5 py-0 text-[10px] text-white`}
          >
            {trait.rarity}
          </Badge>
          <span className="text-xs text-muted-foreground">x{quantity}</span>
        </div>
      </div>
    </button>
  );
}

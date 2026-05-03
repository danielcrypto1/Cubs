"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ImageIcon,
  Smile,
  Eye,
  Glasses,
  Crown,
  Shirt,
  Sparkles,
  Footprints,
  Sticker,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TraitCategory } from "@/lib/trait-registry";
import { rarityTier } from "@/lib/rarity-engine";
import { getTraitImagePath } from "@/lib/trait-registry";

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Background: ImageIcon,
  Body: Sticker,
  Outfit: Shirt,
  Hat: Crown,
  Eyes: Glasses,
  Accessories: Sparkles,
  Mouth: Smile,
  Shoes: Footprints,
  Onsie: Shirt,
};

interface TraitTabsPickerProps {
  categories: TraitCategory[];
  selections: Record<string, string>;
  cubType: "regular" | "onsie" | "oneofone";
  onSelectTrait: (category: string, traitName: string) => void;
  onRemoveTrait: (category: string) => void;
}

export function TraitTabsPicker({
  categories,
  selections,
  cubType,
  onSelectTrait,
  onRemoveTrait,
}: TraitTabsPickerProps) {
  const [activeTab, setActiveTab] = useState<string>(categories[0]?.name ?? "");

  // If categories change (e.g. cubType toggle), make sure activeTab still exists
  useEffect(() => {
    if (!categories.find((c) => c.name === activeTab)) {
      setActiveTab(categories[0]?.name ?? "");
    }
  }, [categories, activeTab]);

  const isOnsie = cubType === "onsie";
  const active = categories.find((c) => c.name === activeTab);
  const selectedTrait = active ? selections[active.name] ?? "None" : "None";

  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden">
      {/* Category icon tabs */}
      <div className="flex items-center gap-1 border-b border-border bg-background/40 p-2">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICON[cat.name] ?? Sparkles;
          const isActive = cat.name === activeTab;
          const value = selections[cat.name];
          const hasSelection = value && value !== "None";
          return (
            <button
              key={cat.name}
              onClick={() => setActiveTab(cat.name)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[10px] font-bold uppercase tracking-widest transition",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
              title={cat.name}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden md:inline">{cat.name}</span>
              {hasSelection && !isActive && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active category panel */}
      {active && (
        <div className="p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {active.name}
              </p>
              <p className="font-display text-xl uppercase tracking-tight">
                {selectedTrait === "None" ? "Empty slot" : selectedTrait.replace(/_/g, " ")}
              </p>
            </div>
            {selectedTrait !== "None" && (
              <button
                onClick={() => onRemoveTrait(active.name)}
                className="text-[10px] uppercase tracking-widest text-muted-foreground transition hover:text-destructive"
              >
                Clear slot
              </button>
            )}
          </div>

          {/* Trait variant grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* None tile */}
            <button
              onClick={() => onRemoveTrait(active.name)}
              className={cn(
                "group flex aspect-square flex-col items-center justify-center rounded-2xl border-2 bg-background/50 transition",
                selectedTrait === "None"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-foreground/30",
              )}
            >
              <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-dashed border-foreground/30 text-[10px] uppercase tracking-widest text-muted-foreground">
                ✕
              </span>
              <span className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                None
              </span>
            </button>

            {active.traits
              .filter((t) => t.name !== "None")
              .sort((a, b) => a.weight - b.weight)
              .map((trait) => {
                const pct = (trait.weight / active.totalWeight) * 100;
                const tier = rarityTier(100 - pct);
                const isSelected = selectedTrait === trait.name;
                const imagePath = getTraitImagePath(active.name, trait.name, isOnsie);

                return (
                  <motion.button
                    key={trait.name}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelectTrait(active.name, trait.name)}
                    className={cn(
                      "relative flex flex-col items-center justify-end overflow-hidden rounded-2xl border-2 bg-background/50 p-3 transition",
                      isSelected
                        ? "border-primary"
                        : "border-border hover:border-foreground/30",
                    )}
                    style={{
                      backgroundImage:
                        "repeating-conic-gradient(oklch(0.10 0 0) 0% 25%, oklch(0.08 0 0) 0% 50%)",
                      backgroundSize: "16px 16px",
                    }}
                    title={trait.displayName}
                  >
                    <div className="relative aspect-square w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePath}
                        alt={trait.displayName}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <span
                      className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                      style={{
                        color: tier.color,
                        background: `${tier.color}22`,
                      }}
                    >
                      {pct.toFixed(1)}%
                    </span>
                    {isSelected && (
                      <span className="absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        ✓
                      </span>
                    )}
                  </motion.button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

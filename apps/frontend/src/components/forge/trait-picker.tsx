"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TraitCategory } from "@/lib/trait-registry";
import { rarityTier } from "@/lib/rarity-engine";

interface TraitPickerProps {
  categories: TraitCategory[];
  selections: Record<string, string>;
  onSelectTrait: (category: string, traitName: string) => void;
  onRemoveTrait: (category: string) => void;
}

export function TraitPicker({
  categories,
  selections,
  onSelectTrait,
  onRemoveTrait,
}: TraitPickerProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    categories[0]?.name ?? null,
  );

  return (
    <div className="space-y-2">
      {categories.map((cat) => {
        const isExpanded = expandedCategory === cat.name;
        const selectedTrait = selections[cat.name] ?? "None";
        const traitInfo = cat.traits.find((t) => t.name === selectedTrait);
        const traitPct = traitInfo
          ? (traitInfo.weight / cat.totalWeight) * 100
          : 0;
        const traitTier =
          selectedTrait === "None" ? null : rarityTier(100 - traitPct);

        return (
          <div
            key={cat.name}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
          >
            {/* Category header */}
            <button
              onClick={() =>
                setExpandedCategory(isExpanded ? null : cat.name)
              }
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  {cat.name}
                </span>
                {selectedTrait !== "None" && traitTier && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      color: traitTier.color,
                      backgroundColor: `${traitTier.color}20`,
                    }}
                  >
                    {traitTier.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {selectedTrait === "None"
                    ? "Empty"
                    : selectedTrait.replace(/_/g, " ")}
                </span>
                <motion.svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </div>
            </button>

            {/* Trait options */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-1.5 p-3 pt-0 sm:grid-cols-3">
                    {/* None option */}
                    <button
                      onClick={() => onRemoveTrait(cat.name)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-left text-xs transition-all",
                        selectedTrait === "None"
                          ? "bg-white/10 text-foreground ring-1 ring-white/20"
                          : "bg-white/[0.02] text-muted-foreground hover:bg-white/5",
                      )}
                    >
                      None
                    </button>

                    {/* Trait options sorted by rarity (rarest first) */}
                    {cat.traits
                      .filter((t) => t.name !== "None")
                      .sort((a, b) => a.weight - b.weight)
                      .map((trait) => {
                        const pct = (trait.weight / cat.totalWeight) * 100;
                        const tier = rarityTier(100 - pct);
                        const isSelected = selectedTrait === trait.name;

                        return (
                          <button
                            key={trait.name}
                            onClick={() =>
                              onSelectTrait(cat.name, trait.name)
                            }
                            className={cn(
                              "group relative rounded-lg px-3 py-2 text-left text-xs transition-all",
                              isSelected
                                ? "bg-white/10 text-foreground ring-1 ring-white/20"
                                : "bg-white/[0.02] text-muted-foreground hover:bg-white/5",
                            )}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate">
                                {trait.displayName}
                              </span>
                              <span
                                className="shrink-0 text-[10px] font-medium"
                                style={{ color: tier.color }}
                              >
                                {pct.toFixed(1)}%
                              </span>
                            </div>
                            {/* Rarity bar */}
                            <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.max(2, 100 - pct)}%`,
                                  backgroundColor: tier.color,
                                }}
                              />
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

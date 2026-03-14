"use client";

import { useState } from "react";
import { TRAIT_LAYER_ORDER } from "@/lib/constants";
import { useTraitRegistry } from "@/hooks/use-trait-registry";
import { TraitItem } from "./trait-item";
import type { TraitCategory, UserTrait, EditorLayerConfig } from "@/types";

interface TraitPanelProps {
  userTraits: UserTrait[];
  layers: EditorLayerConfig[];
  onApplyTrait: (traitDefinitionId: string) => void;
  onRemoveTrait: (category: TraitCategory) => void;
}

export function TraitPanel({ userTraits, layers, onApplyTrait, onRemoveTrait }: TraitPanelProps) {
  const [activeCategory, setActiveCategory] = useState<TraitCategory>("BACKGROUND");
  const { data: registry } = useTraitRegistry();

  // Filter registry to current category
  const categoryTraits = registry.filter((t) => t.category === activeCategory);

  // Build a map of user-owned quantities keyed by traitDefinitionId
  const ownedMap = new Map<string, number>();
  for (const ut of userTraits) {
    ownedMap.set(ut.traitDefinitionId, ut.quantity);
  }

  // Check which trait is currently active in this category
  const activeLayer = layers.find((l) => l.category === activeCategory);

  return (
    <div className="flex h-full flex-col">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border pb-2">
        {TRAIT_LAYER_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat as TraitCategory)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Trait list */}
      <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
        {/* Remove trait option */}
        {activeLayer?.traitDefinitionId && (
          <button
            onClick={() => onRemoveTrait(activeCategory)}
            className="w-full rounded-lg border border-dashed border-destructive/50 p-2 text-center text-xs text-destructive transition-colors hover:bg-destructive/10"
          >
            Remove {activeCategory.toLowerCase()} trait
          </button>
        )}

        {categoryTraits.map((trait) => {
          const quantity = ownedMap.get(trait.id) ?? 0;
          if (quantity === 0) return null;

          return (
            <TraitItem
              key={trait.id}
              trait={trait}
              quantity={quantity}
              isActive={activeLayer?.traitDefinitionId === trait.id}
              onClick={() => onApplyTrait(trait.id)}
            />
          );
        })}

        {categoryTraits.filter((t) => (ownedMap.get(t.id) ?? 0) > 0).length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No owned traits in this category
          </p>
        )}
      </div>
    </div>
  );
}

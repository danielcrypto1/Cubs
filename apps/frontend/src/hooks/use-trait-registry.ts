"use client";

import { useMemo } from "react";
import { MOCK_TRAIT_DEFINITIONS } from "@/lib/mock-data";
import type { TraitCategory, TraitRarity } from "@/types";

interface UseTraitRegistryOptions {
  category?: TraitCategory;
  rarity?: TraitRarity;
}

export function useTraitRegistry(options?: UseTraitRegistryOptions) {
  const data = useMemo(() => {
    let result = MOCK_TRAIT_DEFINITIONS;
    if (options?.category) result = result.filter((t) => t.category === options.category);
    if (options?.rarity) result = result.filter((t) => t.rarity === options.rarity);
    return result;
  }, [options?.category, options?.rarity]);

  return { data, loading: false, error: null };
}

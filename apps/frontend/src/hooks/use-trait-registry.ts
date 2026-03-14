"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import type { TraitDefinition, TraitCategory, TraitRarity } from "@/types";

interface UseTraitRegistryOptions {
  category?: TraitCategory;
  rarity?: TraitRarity;
}

export function useTraitRegistry(options?: UseTraitRegistryOptions) {
  const [data, setData] = useState<TraitDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (options?.category) params.set("category", options.category);
    if (options?.rarity) params.set("rarity", options.rarity);
    const query = params.toString();
    const path = `/api/trait-registry${query ? `?${query}` : ""}`;

    api
      .get<{ data: TraitDefinition[] }>(path)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [options?.category, options?.rarity]);

  return { data, loading, error };
}

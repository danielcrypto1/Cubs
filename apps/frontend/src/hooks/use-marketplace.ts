"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import type { MarketplaceListing, MarketplaceFilters } from "@/types";

interface PaginatedListings {
  listings: MarketplaceListing[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function useMarketplace(filters: MarketplaceFilters) {
  const [data, setData] = useState<PaginatedListings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.assetType) params.set("assetType", filters.assetType);
    if (filters.rarity) params.set("rarity", filters.rarity);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.limit) params.set("limit", filters.limit.toString());

    const qs = params.toString();
    const path = `/api/marketplace${qs ? `?${qs}` : ""}`;

    api
      .get<{ data: PaginatedListings }>(path)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters.assetType, filters.rarity, filters.minPrice, filters.maxPrice, filters.sortBy, filters.page, filters.limit]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { data, loading, error, refetch: fetchListings };
}

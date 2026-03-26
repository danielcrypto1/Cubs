"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MOCK_LISTINGS, type MockListing } from "@/lib/mock-data";
import type { MarketplaceFilters } from "@/types";

interface PaginatedListings {
  listings: MockListing[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ExtendedFilters extends MarketplaceFilters {
  search?: string;
  category?: string;
}

export function useMarketplace(filters: ExtendedFilters) {
  const [listings, setListings] = useState<MockListing[]>([...MOCK_LISTINGS]);
  const [loading, setLoading] = useState(true);

  // Simulate initial load delay
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [filters.assetType, filters.rarity, filters.sortBy, filters.search, filters.category, filters.minPrice, filters.maxPrice]);

  const data = useMemo<PaginatedListings>(() => {
    let filtered = [...listings];

    // Filter by asset type
    if (filters.assetType) {
      filtered = filtered.filter((l) => l.type === filters.assetType);
    }

    // Filter by rarity
    if (filters.rarity) {
      filtered = filtered.filter((l) => l.rarity === filters.rarity);
    }

    // Filter by trait category
    if (filters.category) {
      filtered = filtered.filter((l) => l.category === filters.category);
    }

    // Filter by search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.type.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q) ||
          (l.category && l.category.toLowerCase().includes(q)),
      );
    }

    // Filter by price range
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      if (!isNaN(min)) filtered = filtered.filter((l) => parseFloat(l.price) >= min);
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      if (!isNaN(max)) filtered = filtered.filter((l) => parseFloat(l.price) <= max);
    }

    // Sort
    switch (filters.sortBy) {
      case "price_asc":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price_desc":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.listedAt).getTime() - new Date(b.listedAt).getTime());
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime());
        break;
    }

    // Paginate
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return { listings: paged, total, page, limit, pages };
  }, [listings, filters]);

  const removeListing = useCallback((id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addListing = useCallback((listing: MockListing) => {
    setListings((prev) => [listing, ...prev]);
  }, []);

  const refetch = useCallback(() => {
    // No-op for mock; state is already reactive
  }, []);

  return { data, loading, refetch, removeListing, addListing };
}

"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api-client";
import type { MarketplaceListing, MarketplaceSale, AssetType } from "@/types";

interface ListItemInput {
  assetType: AssetType;
  assetId: string;
  quantity?: number;
  priceWei: string;
}

export function useListingActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listItem = useCallback(async (input: ListItemInput): Promise<MarketplaceListing> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ data: MarketplaceListing }>("/api/marketplace/list-item", input);
      return res.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to list item";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const buyItem = useCallback(async (listingId: string): Promise<{ listing: MarketplaceListing; sale: MarketplaceSale }> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ data: { listing: MarketplaceListing; sale: MarketplaceSale } }>(
        "/api/marketplace/buy-item",
        { listingId },
      );
      return res.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Purchase failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelListing = useCallback(async (listingId: string): Promise<MarketplaceListing> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ data: MarketplaceListing }>(
        "/api/marketplace/cancel-listing",
        { listingId },
      );
      return res.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cancel failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { listItem, buyItem, cancelListing, loading, error };
}

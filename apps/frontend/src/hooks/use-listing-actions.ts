"use client";

import { useState, useCallback } from "react";

export function useListingActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulateTransaction = useCallback(async (): Promise<string> => {
    // Simulate blockchain transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const hash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    return hash;
  }, []);

  const buyItem = useCallback(async (listingId: string): Promise<{ txHash: string }> => {
    setLoading(true);
    setError(null);
    try {
      const txHash = await simulateTransaction();
      return { txHash };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Purchase failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [simulateTransaction]);

  const cancelListing = useCallback(async (listingId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await simulateTransaction();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cancel failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [simulateTransaction]);

  const listItem = useCallback(async (input: {
    type: string;
    name: string;
    price: string;
  }): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const txHash = await simulateTransaction();
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to list item";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [simulateTransaction]);

  return { listItem, buyItem, cancelListing, loading, error };
}

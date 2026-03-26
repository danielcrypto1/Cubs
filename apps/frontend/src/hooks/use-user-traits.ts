"use client";

import { useCallback, useSyncExternalStore } from "react";
import { traitStore } from "@/lib/trait-store";

export function useUserTraits() {
  const data = useSyncExternalStore(
    traitStore.subscribe,
    traitStore.getTraits,
    traitStore.getTraits,
  );

  const refetch = useCallback(() => {
    // No-op for mock data — store is reactive
  }, []);

  return { data, loading: false, error: null, refetch };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import type { UserCrate, CrateOpenResult } from "@/types";

export function useCrates() {
  const [data, setData] = useState<UserCrate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    api
      .get<{ data: UserCrate[] }>("/api/crates")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const openCrate = useCallback(
    async (crateDefinitionId: string): Promise<CrateOpenResult> => {
      const res = await api.post<{ data: CrateOpenResult }>("/api/crates/open", {
        crateDefinitionId,
      });
      refetch();
      return res.data;
    },
    [refetch],
  );

  return { data, loading, error, refetch, openCrate };
}

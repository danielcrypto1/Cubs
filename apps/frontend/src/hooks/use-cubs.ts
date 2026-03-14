"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { Cub } from "@/types";

interface CubsResponse {
  cubs: Cub[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function useCubs(owner?: string) {
  const [data, setData] = useState<CubsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCubs() {
      try {
        setLoading(true);
        const path = owner ? `/api/cubs?owner=${owner}` : "/api/cubs";
        const result = await api.get<CubsResponse>(path);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch cubs");
      } finally {
        setLoading(false);
      }
    }
    fetchCubs();
  }, [owner]);

  return { data, loading, error };
}

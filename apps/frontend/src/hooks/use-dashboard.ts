"use client";

import { useState, useMemo } from "react";
import { MOCK_CUBS, MOCK_BUD_BEARS, MOCK_DASHBOARD_STATS } from "@/lib/mock-data";
import type { DashboardTab } from "@/types";

export function useDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("collection");
  const [nftFilter, setNftFilter] = useState<"all" | "cubs" | "budbears">("all");

  const cubs = MOCK_CUBS;
  const budBears = MOCK_BUD_BEARS;
  const stats = MOCK_DASHBOARD_STATS;

  const filteredNfts = useMemo(() => {
    if (nftFilter === "cubs") return { cubs, budBears: [] };
    if (nftFilter === "budbears") return { cubs: [], budBears };
    return { cubs, budBears };
  }, [nftFilter, cubs, budBears]);

  return {
    activeTab,
    setActiveTab,
    nftFilter,
    setNftFilter,
    cubs: filteredNfts.cubs,
    budBears: filteredNfts.budBears,
    allCubs: cubs,
    allBudBears: budBears,
    stats,
  };
}

"use client";

import { useState, useCallback } from "react";
import { MOCK_BURN_REWARDS } from "@/lib/mock-data";
import type { MockCub } from "@/lib/mock-data";

type BurnStatus = "idle" | "selected" | "confirming" | "burning" | "complete";

interface BurnState {
  selectedCub: MockCub | null;
  status: BurnStatus;
  rewards: { tokens: number; traitName: string | null } | null;
}

export function useBurn(cubs: MockCub[]) {
  const [state, setState] = useState<BurnState>({
    selectedCub: null,
    status: "idle",
    rewards: null,
  });

  const selectCub = useCallback((cubId: string) => {
    const cub = cubs.find((c) => c.id === cubId);
    if (!cub) return;
    setState({ selectedCub: cub, status: "selected", rewards: null });
  }, [cubs]);

  const confirmBurn = useCallback(async () => {
    if (!state.selectedCub) return;
    setState((prev) => ({ ...prev, status: "confirming" }));

    // brief pause for confirmation animation
    await new Promise((r) => setTimeout(r, 500));
    setState((prev) => ({ ...prev, status: "burning" }));

    // simulate burn transaction
    await new Promise((r) => setTimeout(r, 2000));

    const highestRarity = state.selectedCub.traits[0]?.rarity ?? "COMMON";
    const rewardInfo = MOCK_BURN_REWARDS[highestRarity] ?? MOCK_BURN_REWARDS.COMMON;
    const gotTrait = Math.random() < rewardInfo.traitChance;

    setState((prev) => ({
      ...prev,
      status: "complete",
      rewards: {
        tokens: rewardInfo.tokens,
        traitName: gotTrait ? "Random Trait Drop" : null,
      },
    }));
  }, [state.selectedCub]);

  const cancelBurn = useCallback(() => {
    setState({ selectedCub: null, status: "idle", rewards: null });
  }, []);

  const reset = useCallback(() => {
    setState({ selectedCub: null, status: "idle", rewards: null });
  }, []);

  return {
    selectedCub: state.selectedCub,
    status: state.status,
    rewards: state.rewards,
    selectCub,
    confirmBurn,
    cancelBurn,
    reset,
  };
}

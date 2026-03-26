"use client";

import { useState, useCallback } from "react";
import { SUPPORTED_CHAINS } from "@/lib/contracts";
import type { MockCub } from "@/lib/mock-data";
import type { BridgeStatus } from "@/types";

interface BridgeState {
  selectedCub: MockCub | null;
  destChain: typeof SUPPORTED_CHAINS[number] | null;
  status: BridgeStatus;
  txHash: string | null;
}

export function useBridge(cubs: MockCub[]) {
  const [state, setState] = useState<BridgeState>({
    selectedCub: null,
    destChain: null,
    status: "idle",
    txHash: null,
  });

  const selectCub = useCallback((cubId: string) => {
    const cub = cubs.find((c) => c.id === cubId);
    if (!cub) return;
    setState((prev) => ({ ...prev, selectedCub: cub, status: prev.destChain ? "configured" : "idle" }));
  }, [cubs]);

  const selectChain = useCallback((chainId: string) => {
    const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
    if (!chain) return;
    setState((prev) => ({ ...prev, destChain: chain, status: prev.selectedCub ? "configured" : "idle" }));
  }, []);

  const initiateBridge = useCallback(async () => {
    if (!state.selectedCub || !state.destChain) return;
    if (state.destChain.status === "coming_soon") return;

    setState((prev) => ({ ...prev, status: "confirming" }));
    await new Promise((r) => setTimeout(r, 1000));

    setState((prev) => ({ ...prev, status: "bridging" }));
    await new Promise((r) => setTimeout(r, 3000));

    const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    setState((prev) => ({ ...prev, status: "complete", txHash: mockTxHash }));
  }, [state.selectedCub, state.destChain]);

  const reset = useCallback(() => {
    setState({ selectedCub: null, destChain: null, status: "idle", txHash: null });
  }, []);

  return {
    selectedCub: state.selectedCub,
    destChain: state.destChain,
    status: state.status,
    txHash: state.txHash,
    chains: SUPPORTED_CHAINS,
    selectCub,
    selectChain,
    initiateBridge,
    reset,
  };
}

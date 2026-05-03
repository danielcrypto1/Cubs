"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { MockBudBear } from "@/lib/mock-data";
import type { BreedingStatus } from "@/types";

const BREED_DURATION = 30_000; // 30 seconds mock

interface BreedingState {
  parent1: MockBudBear | null;
  parent2: MockBudBear | null;
  status: BreedingStatus;
  timeRemaining: number;
  resultName: string | null;
}

export function useBreeding(budBears: MockBudBear[]) {
  const [state, setState] = useState<BreedingState>({
    parent1: null,
    parent2: null,
    status: "idle",
    timeRemaining: 0,
    resultName: null,
  });
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const startTimeRef = useRef(0);

  const selectParent = useCallback((slot: 1 | 2, bearId: string) => {
    const bear = budBears.find((b) => b.id === bearId);
    if (!bear) return;
    setState((prev) => ({
      ...prev,
      [slot === 1 ? "parent1" : "parent2"]: bear,
      status: "selecting",
    }));
  }, [budBears]);

  const clearParent = useCallback((slot: 1 | 2) => {
    setState((prev) => ({
      ...prev,
      [slot === 1 ? "parent1" : "parent2"]: null,
      status: prev.parent1 && prev.parent2 ? "selecting" : "idle",
    }));
  }, []);

  const canBreed = state.parent1 !== null && state.parent2 !== null && state.status !== "breeding" && state.status !== "complete";

  const startBreeding = useCallback(() => {
    if (!canBreed) return;
    startTimeRef.current = Date.now();
    setState((prev) => ({
      ...prev,
      status: "breeding",
      timeRemaining: BREED_DURATION,
      resultName: null,
    }));
  }, [canBreed]);

  useEffect(() => {
    if (state.status !== "breeding") return;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, BREED_DURATION - elapsed);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        const names = ["Luna", "Nova", "Kodiak", "Maple", "Ziggy", "Clover", "Pebble", "Ash"];
        setState((prev) => ({
          ...prev,
          status: "complete",
          timeRemaining: 0,
          resultName: names[Math.floor(Math.random() * names.length)],
        }));
      } else {
        setState((prev) => ({ ...prev, timeRemaining: remaining }));
      }
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [state.status]);

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setState({ parent1: null, parent2: null, status: "idle", timeRemaining: 0, resultName: null });
  }, []);

  return {
    parent1: state.parent1,
    parent2: state.parent2,
    status: state.status,
    timeRemaining: state.timeRemaining,
    resultName: state.resultName,
    canBreed,
    selectParent,
    clearParent,
    startBreeding,
    reset,
  };
}

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  type PointsBalance,
  type PointsTransaction,
  getPointsBalance,
  getPointsHistory,
  earnPoints,
  spendPoints,
  getAvailablePoints,
} from "@/lib/points";

export function usePoints() {
  const [balance, setBalance] = useState<PointsBalance>({
    total: 0,
    earned: { staking: 0, activity: 0, discord: 0, achievements: 0 },
    spent: 0,
  });
  const [history, setHistory] = useState<PointsTransaction[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setBalance(getPointsBalance());
    setHistory(getPointsHistory());
  }, []);

  const available = balance.total - balance.spent;

  const earn = useCallback(
    (source: PointsTransaction["source"], amount: number, description: string) => {
      const updated = earnPoints(source, amount, description);
      setBalance(updated);
      setHistory(getPointsHistory());
      return updated;
    },
    [],
  );

  const spend = useCallback(
    (source: PointsTransaction["source"], amount: number, description: string) => {
      const updated = spendPoints(source, amount, description);
      if (updated) {
        setBalance(updated);
        setHistory(getPointsHistory());
      }
      return updated;
    },
    [],
  );

  return {
    balance,
    available,
    history,
    earn,
    spend,
  };
}

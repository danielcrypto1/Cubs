"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { rarityTier } from "@/lib/rarity-engine";

interface LeaderboardEntry {
  rank: number;
  id: number;
  score: number;
  tier: { label: string; color: string };
  highlight?: boolean;
}

interface RarityLeaderboardProps {
  /** The current forge build's rarity percentage */
  currentScore: number;
}

/**
 * Mock leaderboard showing where the current forge build would rank.
 * In production this would pull from an API/indexer.
 */
export function RarityLeaderboard({ currentScore }: RarityLeaderboardProps) {
  const entries = useMemo(() => {
    // Generate mock leaderboard with realistic spread
    const mockScores = [
      { id: 2847, score: 98.2 },
      { id: 1234, score: 95.7 },
      { id: 3001, score: 93.1 },
      { id: 892, score: 91.4 },
      { id: 1567, score: 88.9 },
      { id: 2103, score: 86.2 },
      { id: 445, score: 83.5 },
      { id: 3210, score: 80.1 },
      { id: 1789, score: 77.6 },
      { id: 567, score: 74.3 },
    ];

    // Insert current build
    const allEntries = [
      ...mockScores.map((e) => ({ ...e, highlight: false })),
      { id: 0, score: currentScore, highlight: true },
    ];

    // Sort by score descending
    allEntries.sort((a, b) => b.score - a.score);

    // Assign ranks and take top 10
    return allEntries.slice(0, 10).map((entry, i) => ({
      ...entry,
      rank: i + 1,
      tier: rarityTier(entry.score),
    })) as LeaderboardEntry[];
  }, [currentScore]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Rarity Leaderboard
      </h3>

      <div className="space-y-1.5">
        {entries.map((entry) => (
          <motion.div
            key={`${entry.id}-${entry.highlight}`}
            layout
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
              entry.highlight
                ? "bg-primary/10 ring-1 ring-primary/30"
                : "bg-white/[0.02]"
            }`}
          >
            {/* Rank */}
            <span
              className={`w-6 text-center font-bold ${
                entry.rank <= 3 ? "" : "text-muted-foreground"
              }`}
              style={
                entry.rank <= 3 ? { color: entry.tier.color } : undefined
              }
            >
              {entry.rank <= 3
                ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                : `#${entry.rank}`}
            </span>

            {/* Name */}
            <span className="flex-1 truncate">
              {entry.highlight ? (
                <span className="font-medium text-primary">Your Build</span>
              ) : (
                <span className="text-muted-foreground">
                  Cub #{entry.id}
                </span>
              )}
            </span>

            {/* Score */}
            <span
              className="text-xs font-medium"
              style={{ color: entry.tier.color }}
            >
              {entry.score.toFixed(1)}
            </span>

            {/* Tier badge */}
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                color: entry.tier.color,
                backgroundColor: `${entry.tier.color}20`,
              }}
            >
              {entry.tier.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

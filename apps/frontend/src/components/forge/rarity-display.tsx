"use client";

import { motion } from "framer-motion";
import type { RarityTier } from "@/lib/rarity-engine";

interface RarityDisplayProps {
  percentage: number;
  tier: RarityTier;
  delta: { current: number; proposed: number; delta: number };
  breakdown: { category: string; trait: string; percentage: number; tierLabel: string }[];
}

export function RarityDisplay({ percentage, tier, delta }: RarityDisplayProps) {
  const circumference = 2 * Math.PI * 54; // radius 54
  const strokeDash = (percentage / 100) * circumference;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Rarity Score
      </h3>

      <div className="flex items-center gap-6">
        {/* Circular gauge */}
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-white/5"
            />
            {/* Rarity ring */}
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={tier.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - strokeDash }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={percentage}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold"
              style={{ color: tier.color }}
            >
              {percentage.toFixed(1)}
            </motion.span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>

        {/* Tier and delta info */}
        <div className="space-y-3">
          <div>
            <span
              className="text-lg font-bold"
              style={{ color: tier.color }}
            >
              {tier.label}
            </span>
            <p className="text-xs text-muted-foreground">Rarity Tier</p>
          </div>

          {delta.delta !== 0 && (
            <div>
              <span
                className={`text-sm font-medium ${
                  delta.delta > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {delta.delta > 0 ? "+" : ""}
                {delta.delta.toFixed(1)}%
              </span>
              <p className="text-xs text-muted-foreground">
                {delta.delta > 0 ? "Rarer" : "More common"} than original
              </p>
            </div>
          )}

          <div>
            <span className="text-sm text-muted-foreground">
              Est. Rank:{" "}
              <span className="text-foreground">
                #{Math.max(1, Math.round(3319 * (1 - percentage / 100)))}
              </span>{" "}
              / 3,319
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Coins, Zap, Users, TrendingUp } from "lucide-react";
import type { CubAgent } from "./agent-card";

interface AgentStatsPanelProps {
  agents: CubAgent[];
}

export function AgentStatsPanel({ agents }: AgentStatsPanelProps) {
  const totalEarning = agents
    .filter((a) => a.status === "working")
    .reduce((sum, a) => sum + a.pawsPerHour, 0);

  const totalEarned = agents.reduce((sum, a) => sum + a.totalEarned, 0);
  const activeCount = agents.filter((a) => a.status === "working").length;
  const avgLevel = agents.length
    ? Math.round(agents.reduce((sum, a) => sum + a.level, 0) / agents.length)
    : 0;

  const stats = [
    { label: "Active Agents", value: `${activeCount}/${agents.length}`, icon: Users, color: "text-green-400" },
    { label: "PAWS/Hour", value: totalEarning.toLocaleString(), icon: Zap, color: "text-cubs-gold" },
    { label: "Total Earned", value: totalEarned.toLocaleString(), icon: Coins, color: "text-amber-400" },
    { label: "Avg Level", value: `Lv.${avgLevel}`, icon: TrendingUp, color: "text-cubs-sky" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
        >
          <stat.icon className={`h-5 w-5 ${stat.color}`} />
          <span className="text-lg font-bold tabular-nums">{stat.value}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

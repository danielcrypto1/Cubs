"use client";

import { motion } from "framer-motion";
import { Users, Package, TrendingUp, Coins } from "lucide-react";
import { CountUp } from "./count-up";

const STATS = [
  { label: "Cubs Minted", value: 4_821, icon: Users, color: "text-cubs-gold" },
  { label: "Crates Opened", value: 12_340, icon: Package, color: "text-cubs-purple" },
  { label: "Traits Traded", value: 8_762, icon: TrendingUp, color: "text-cubs-sky" },
  { label: "PAWS Earned", value: 2_450_000, icon: Coins, color: "text-cubs-green" },
];

export function LiveStatsBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="group flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-white/10"
        >
          <stat.icon className={`h-5 w-5 ${stat.color}`} />
          <span className="text-lg font-bold tabular-nums">
            <CountUp value={stat.value.toLocaleString()} />
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {stat.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

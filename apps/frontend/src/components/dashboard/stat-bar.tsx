"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PawPrint, TreePine, Lock, Tag, Heart } from "lucide-react";

interface StatBarProps {
  stats: {
    totalCubs: number;
    totalBudBears: number;
    stakedCubs: number;
    listedCubs: number;
    totalBred: number;
  };
}

const STAT_CONFIG = [
  { key: "totalCubs" as const, label: "Cubs", icon: PawPrint, colour: "text-cubs-gold" },
  { key: "totalBudBears" as const, label: "Bud Bears", icon: TreePine, colour: "text-cubs-green" },
  { key: "stakedCubs" as const, label: "Staked", icon: Lock, colour: "text-cubs-sky" },
  { key: "listedCubs" as const, label: "Listed", icon: Tag, colour: "text-cubs-purple" },
  { key: "totalBred" as const, label: "Bred", icon: Heart, colour: "text-cubs-pink" },
];

export function StatBar({ stats }: StatBarProps) {
  return (
    <motion.div
      className="flex flex-wrap gap-3"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {STAT_CONFIG.map((s) => (
        <motion.div
          key={s.key}
          variants={staggerItem}
          className="flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 border border-border"
        >
          <s.icon className={`h-4 w-4 ${s.colour}`} />
          <span className="text-sm text-muted-foreground">{s.label}</span>
          <span className="text-sm font-bold">{stats[s.key]}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Coins, Paintbrush, ShoppingBag, Zap } from "lucide-react";

const ACTIONS = [
  { label: "Open Crate", href: "/crates", icon: Package, color: "from-purple-500/20 to-purple-600/10 hover:from-purple-500/30 text-cubs-purple" },
  { label: "Claim PAWS", href: "/staking", icon: Coins, color: "from-green-500/20 to-green-600/10 hover:from-green-500/30 text-cubs-green" },
  { label: "Cub Forge", href: "/forge", icon: Paintbrush, color: "from-pink-500/20 to-pink-600/10 hover:from-pink-500/30 text-cubs-pink" },
  { label: "Agents", href: "/agents", icon: Zap, color: "from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 text-cubs-gold" },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag, color: "from-sky-500/20 to-sky-600/10 hover:from-sky-500/30 text-cubs-sky" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACTIONS.map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i }}
        >
          <Link
            href={action.href}
            className={`flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-b ${action.color} p-4 backdrop-blur-sm transition-all hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]`}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-xs font-semibold">{action.label}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

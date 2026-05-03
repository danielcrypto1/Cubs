"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Hammer, ShoppingBag, Sparkles, Map } from "lucide-react";

const ACTIONS = [
  { label: "Mint", href: "/mint", icon: Sparkles },
  { label: "Cub Forge", href: "/forge", icon: Hammer },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { label: "Roadmap", href: "/roadmap", icon: Map },
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
            className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 transition hover:border-primary"
          >
            <action.icon className="h-6 w-6 text-primary transition group-hover:scale-110" />
            <span className="text-xs font-bold uppercase tracking-widest text-foreground">{action.label}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

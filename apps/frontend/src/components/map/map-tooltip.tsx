"use client";

import { motion } from "framer-motion";
import { popIn } from "@/lib/animations";

interface MapTooltipProps {
  name: string;
  description: string;
}

export function MapTooltip({ name, description }: MapTooltipProps) {
  return (
    <motion.div
      className="absolute bottom-full left-1/2 z-30 mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border/50 bg-card px-4 py-2.5 shadow-lg"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={popIn}
    >
      {/* Gold accent bar */}
      <div className="absolute -top-px left-3 right-3 h-0.5 rounded-full bg-primary" />
      <p className="font-display text-sm font-bold">{name}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      {/* Arrow */}
      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-card" />
    </motion.div>
  );
}

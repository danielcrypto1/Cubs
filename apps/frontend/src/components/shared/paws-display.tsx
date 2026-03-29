"use client";

import { motion } from "framer-motion";
import { Coins } from "lucide-react";

interface PawsDisplayProps {
  balance: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  animated?: boolean;
}

function formatPaws(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const sizeClasses = {
  sm: "text-xs gap-1",
  md: "text-sm gap-1.5",
  lg: "text-base gap-2",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function PawsDisplay({ balance, size = "md", showIcon = true, animated = false }: PawsDisplayProps) {
  const Wrapper = animated ? motion.div : "div";
  const wrapperProps = animated
    ? { whileHover: { scale: 1.05 }, whileTap: { scale: 0.97 } }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`inline-flex items-center rounded-full border border-cubs-gold/20 bg-cubs-gold/10 px-3 py-1 font-bold text-cubs-gold ${sizeClasses[size]}`}
    >
      {showIcon && <Coins className={iconSizes[size]} />}
      <span className="tabular-nums">{formatPaws(balance)}</span>
      <span className="text-cubs-gold/60">PAWS</span>
    </Wrapper>
  );
}

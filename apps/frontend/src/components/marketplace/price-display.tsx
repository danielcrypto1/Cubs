"use client";

import { formatWeiToEth } from "@/lib/format";

interface PriceDisplayProps {
  priceWei: string;
  className?: string;
}

export function PriceDisplay({ priceWei, className }: PriceDisplayProps) {
  return (
    <span className={className}>
      <span className="font-semibold">{formatWeiToEth(priceWei)}</span>
      <span className="ml-1 text-muted-foreground">ETH</span>
    </span>
  );
}

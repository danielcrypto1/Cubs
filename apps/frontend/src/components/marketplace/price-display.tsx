"use client";

import { formatWeiToEth } from "@/lib/format";

interface PriceDisplayProps {
  priceType: "PAWS" | "ETH" | "USDT";
  priceAmount: string;
  className?: string;
}

export function PriceDisplay({ priceType, priceAmount, className }: PriceDisplayProps) {
  if (priceType === "PAWS") {
    return (
      <span className={className}>
        <span className="font-semibold">{Number(priceAmount).toLocaleString()}</span>
        <span className="ml-1 text-muted-foreground">PAWS</span>
      </span>
    );
  }

  if (priceType === "USDT") {
    return (
      <span className={className}>
        <span className="font-semibold">${Number(priceAmount).toLocaleString()}</span>
        <span className="ml-1 text-muted-foreground">USDT</span>
      </span>
    );
  }

  return (
    <span className={className}>
      <span className="font-semibold">{formatWeiToEth(priceAmount)}</span>
      <span className="ml-1 text-muted-foreground">ETH</span>
    </span>
  );
}

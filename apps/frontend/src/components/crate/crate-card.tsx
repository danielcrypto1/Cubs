"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CrateDefinition } from "@/types";

const RARITY_VARIANTS: Record<string, "common" | "uncommon" | "rare" | "epic" | "legendary"> = {
  COMMON: "common",
  UNCOMMON: "uncommon",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
};

const DROP_RATE_COLORS: Record<string, string> = {
  Common: "text-zinc-400",
  Uncommon: "text-green-400",
  Rare: "text-blue-400",
  Epic: "text-purple-400",
  Legendary: "text-amber-400",
};

interface CrateCardProps {
  crateDefinition: CrateDefinition;
  quantity: number;
  dropRates?: { rarity: string; chance: number }[];
  onOpen: () => void;
  isOpening: boolean;
}

export function CrateCard({ crateDefinition, quantity, dropRates, onOpen, isOpening }: CrateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden cubs-card-hover">
        <div className="relative aspect-square">
          <Image
            src={crateDefinition.imageUrl}
            alt={crateDefinition.name}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{crateDefinition.name}</CardTitle>
            <Badge variant={RARITY_VARIANTS[crateDefinition.rarity] ?? "common"}>
              {crateDefinition.rarity}
            </Badge>
          </div>
          {crateDefinition.description && (
            <p className="text-xs text-muted-foreground">{crateDefinition.description}</p>
          )}
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          {/* Drop rates */}
          {dropRates && dropRates.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Drop Rates
              </p>
              {dropRates.map((rate) => (
                <div key={rate.rarity} className="flex items-center justify-between text-xs">
                  <span className={DROP_RATE_COLORS[rate.rarity] ?? "text-muted-foreground"}>
                    {rate.rarity}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${
                          rate.rarity === "Legendary" ? "bg-amber-400" :
                          rate.rarity === "Epic" ? "bg-purple-400" :
                          rate.rarity === "Rare" ? "bg-blue-400" :
                          rate.rarity === "Uncommon" ? "bg-green-400" :
                          "bg-zinc-400"
                        }`}
                        style={{ width: `${rate.chance}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">{rate.chance}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Owned: {quantity}</span>
            <Button
              size="sm"
              onClick={onOpen}
              disabled={quantity === 0 || isOpening}
            >
              {isOpening ? "Opening..." : "Open"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

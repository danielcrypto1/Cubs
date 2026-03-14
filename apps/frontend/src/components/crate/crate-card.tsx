"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CrateDefinition } from "@/types";

const RARITY_COLORS: Record<string, string> = {
  COMMON: "bg-zinc-600",
  UNCOMMON: "bg-green-600",
  RARE: "bg-blue-600",
  EPIC: "bg-purple-600",
  LEGENDARY: "bg-amber-500",
};

interface CrateCardProps {
  crateDefinition: CrateDefinition;
  quantity: number;
  onOpen: () => void;
  isOpening: boolean;
}

export function CrateCard({ crateDefinition, quantity, onOpen, isOpening }: CrateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <div className="relative aspect-square">
          <Image
            src={crateDefinition.imageUrl}
            alt={crateDefinition.name}
            fill
            className="object-cover"
          />
        </div>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{crateDefinition.name}</CardTitle>
            <Badge
              className={`${RARITY_COLORS[crateDefinition.rarity] ?? ""} px-2 py-0.5 text-xs text-white`}
            >
              {crateDefinition.rarity}
            </Badge>
          </div>
          {crateDefinition.description && (
            <p className="text-xs text-muted-foreground">{crateDefinition.description}</p>
          )}
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
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

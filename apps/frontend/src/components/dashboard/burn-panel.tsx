"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { popIn } from "@/lib/animations";
import { Flame, AlertTriangle, ArrowLeft, Coins, Sparkles, RotateCcw } from "lucide-react";
import type { MockCub } from "@/lib/mock-data";

interface BurnPanelProps {
  cubs: MockCub[];
  selectedCub: MockCub | null;
  status: string;
  rewards: { tokens: number; traitName: string | null } | null;
  onSelectCub: (cubId: string) => void;
  onConfirmBurn: () => void;
  onCancel: () => void;
  onReset: () => void;
}

export function BurnPanel({ cubs, selectedCub, status, rewards, onSelectCub, onConfirmBurn, onCancel, onReset }: BurnPanelProps) {
  // Complete state — show rewards
  if (status === "complete" && rewards) {
    return (
      <motion.div initial="hidden" animate="visible" variants={popIn} className="flex flex-col items-center gap-6 py-8">
        <Flame className="h-16 w-16 text-cubs-orange" />
        <h3 className="text-2xl font-bold">Cub Burned!</h3>
        <div className="flex gap-4">
          <Card className="px-6 py-4 text-center">
            <Coins className="mx-auto mb-2 h-8 w-8 text-cubs-gold" />
            <p className="text-2xl font-bold text-primary">{rewards.tokens}</p>
            <p className="text-xs text-muted-foreground">CUBS Tokens</p>
          </Card>
          {rewards.traitName && (
            <Card className="px-6 py-4 text-center">
              <Sparkles className="mx-auto mb-2 h-8 w-8 text-cubs-purple" />
              <p className="text-sm font-bold">{rewards.traitName}</p>
              <p className="text-xs text-muted-foreground">Bonus Drop!</p>
            </Card>
          )}
        </div>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Done
        </Button>
      </motion.div>
    );
  }

  // Burning animation
  if (status === "burning") {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <motion.div
          animate={{ scale: [1, 1.3, 0], opacity: [1, 1, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, ease: "easeIn" }}
        >
          <Flame className="h-20 w-20 text-orange-500" />
        </motion.div>
        <p className="text-lg font-medium text-muted-foreground">Burning your Cub...</p>
      </div>
    );
  }

  // Confirmation state
  if (status === "selected" && selectedCub) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <Card className="overflow-hidden border-destructive/50">
          <div className="relative aspect-square bg-muted">
            <Image src={selectedCub.imageUrl} alt={selectedCub.name} fill unoptimized className="object-cover" />
          </div>
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold">{selectedCub.name}</p>
            <p className="text-sm text-muted-foreground">#{selectedCub.tokenId}</p>
          </CardContent>
        </Card>

        <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="text-sm">
              <p className="font-semibold text-destructive">This action is permanent</p>
              <p className="mt-1 text-muted-foreground">
                Burning this Cub will destroy it forever. You will receive CUBS tokens
                and a chance at a rare trait drop based on your Cub&apos;s rarity.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirmBurn}>
            <Flame className="mr-2 h-4 w-4" /> Burn Cub
          </Button>
        </div>
      </div>
    );
  }

  // Selection state — pick a cub to burn
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Select a Cub to burn. You&apos;ll receive CUBS tokens and a chance at a rare trait drop.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cubs.map((cub) => (
          <Card
            key={cub.id}
            className="cursor-pointer overflow-hidden cubs-card-hover"
            onClick={() => onSelectCub(cub.id)}
          >
            <div className="relative aspect-square cubs-image-zoom bg-muted">
              <Image src={cub.imageUrl} alt={cub.name} fill unoptimized className="object-cover" />
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{cub.name}</p>
                <Badge variant="outline" className="text-[10px]">#{cub.tokenId}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

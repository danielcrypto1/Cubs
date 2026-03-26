"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { popIn, springBouncy } from "@/lib/animations";
import { Heart, Plus, X, Sparkles, RotateCcw } from "lucide-react";
import type { MockBudBear } from "@/lib/mock-data";

interface BreedPanelProps {
  budBears: MockBudBear[];
  parent1: MockBudBear | null;
  parent2: MockBudBear | null;
  status: string;
  timeRemaining: number;
  resultName: string | null;
  canBreed: boolean;
  onSelectParent: (slot: 1 | 2, bearId: string) => void;
  onClearParent: (slot: 1 | 2) => void;
  onBreed: () => void;
  onReset: () => void;
}

export function BreedPanel({
  budBears, parent1, parent2, status, timeRemaining, resultName, canBreed,
  onSelectParent, onClearParent, onBreed, onReset,
}: BreedPanelProps) {
  const availableBears = budBears.filter(
    (b) => b.id !== parent1?.id && b.id !== parent2?.id,
  );
  const seconds = Math.ceil(timeRemaining / 1000);

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Select two Bud Bears to breed and create a new Cub.
      </p>

      {/* Parent slots + merge area */}
      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-8">
        <ParentSlot
          label="Parent 1"
          bear={parent1}
          onClear={() => onClearParent(1)}
          disabled={status === "breeding" || status === "complete"}
        />

        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={status === "breeding" ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 1.5, repeat: status === "breeding" ? Infinity : 0 }}
          >
            <Heart className="h-10 w-10 text-cubs-pink" />
          </motion.div>
          {status === "breeding" && (
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-primary">{seconds}s</p>
              <p className="text-xs text-muted-foreground">Breeding...</p>
            </div>
          )}
        </div>

        <ParentSlot
          label="Parent 2"
          bear={parent2}
          onClear={() => onClearParent(2)}
          disabled={status === "breeding" || status === "complete"}
        />
      </div>

      {/* Breed button */}
      {status !== "complete" && (
        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!canBreed || status === "breeding"}
            onClick={onBreed}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {status === "breeding" ? "Breeding..." : "Breed Cubs"}
          </Button>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {status === "complete" && resultName && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={popIn}
            className="flex flex-col items-center gap-4"
          >
            <Card className="w-64 overflow-hidden border-primary">
              <div className="relative aspect-square bg-muted">
                <Image
                  src="https://placehold.co/400x400/1a1a2e/f59e0b?text=New+Cub"
                  alt="New Cub"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <Badge className="absolute right-2 top-2 bg-primary text-primary-foreground">NEW</Badge>
              </div>
              <CardContent className="p-4 text-center">
                <p className="text-lg font-bold">{resultName}</p>
                <p className="text-sm text-muted-foreground">Your new Cub has arrived!</p>
              </CardContent>
            </Card>
            <Button variant="outline" onClick={onReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Breed Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Available bears for selection */}
      {status !== "breeding" && status !== "complete" && availableBears.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Select a Bud Bear</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableBears.map((bear) => (
              <Card
                key={bear.id}
                className="cursor-pointer overflow-hidden cubs-card-hover"
                onClick={() => {
                  if (!parent1) onSelectParent(1, bear.id);
                  else if (!parent2) onSelectParent(2, bear.id);
                }}
              >
                <div className="flex items-center gap-3 p-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={bear.imageUrl} alt={bear.name} fill unoptimized className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{bear.name}</p>
                    <p className="text-xs text-muted-foreground">#{bear.tokenId} · Bred {bear.breedCount}x</p>
                  </div>
                  <Plus className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ParentSlot({ label, bear, onClear, disabled }: { label: string; bear: MockBudBear | null; onClear: () => void; disabled: boolean }) {
  return (
    <div className="w-48">
      <p className="mb-2 text-center text-xs font-medium text-muted-foreground">{label}</p>
      {bear ? (
        <Card className="relative overflow-hidden">
          <div className="relative aspect-square bg-muted">
            <Image src={bear.imageUrl} alt={bear.name} fill unoptimized className="object-cover" />
          </div>
          <CardContent className="p-2 text-center">
            <p className="text-sm font-semibold">{bear.name}</p>
            <p className="text-[10px] text-muted-foreground">#{bear.tokenId}</p>
          </CardContent>
          {!disabled && (
            <button
              onClick={onClear}
              className="absolute right-1 top-1 rounded-full bg-background/80 p-1 backdrop-blur-sm hover:bg-destructive/80"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Card>
      ) : (
        <Card className="flex aspect-square items-center justify-center border-dashed">
          <div className="text-center text-muted-foreground">
            <Plus className="mx-auto h-8 w-8" />
            <p className="mt-1 text-xs">Select Bear</p>
          </div>
        </Card>
      )}
    </div>
  );
}

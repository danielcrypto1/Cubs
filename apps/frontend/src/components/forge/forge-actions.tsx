"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flame, Sparkles, Shuffle, RotateCcw } from "lucide-react";

interface ForgeActionsProps {
  onRandomize: () => void;
  onReset: () => void;
  hasChanges: boolean;
  rarityScore: number;
}

export function ForgeActions({
  onRandomize,
  onReset,
  hasChanges,
  rarityScore,
}: ForgeActionsProps) {
  const [showBurnConfirm, setShowBurnConfirm] = useState(false);

  return (
    <div className="space-y-3">
      {/* Quick actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRandomize}
          className="flex-1 gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Randomize
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={!hasChanges}
          className="flex-1 gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Burn & Forge */}
      <AnimatePresence mode="wait">
        {!showBurnConfirm ? (
          <motion.div key="forge-btn" exit={{ opacity: 0, y: -10 }}>
            <Button
              className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              size="lg"
              onClick={() => setShowBurnConfirm(true)}
              disabled={!hasChanges}
            >
              <Flame className="h-5 w-5" />
              Burn & Forge New Cub
            </Button>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
              Burns your current NFT and mints a new one with these traits
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-red-400">
              <Flame className="h-4 w-4" />
              Confirm Burn & Forge
            </div>
            <p className="text-xs text-muted-foreground">
              This will permanently burn your current Cub NFT and mint a new
              one with the selected traits. This action cannot be undone.
            </p>
            <p className="text-xs text-muted-foreground">
              New rarity score:{" "}
              <span className="font-medium text-foreground">
                {rarityScore.toFixed(1)}%
              </span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowBurnConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 gap-2 bg-red-500 text-white hover:bg-red-600"
                onClick={() => {
                  // TODO: Connect to smart contract
                  setShowBurnConfirm(false);
                }}
              >
                <Flame className="h-4 w-4" />
                Confirm Burn
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mint new (no burn needed) */}
      <Button variant="outline" className="w-full gap-2" disabled>
        <Sparkles className="h-4 w-4" />
        Mint Fresh Cub
        <span className="ml-auto text-xs text-muted-foreground">
          Coming Soon
        </span>
      </Button>
    </div>
  );
}

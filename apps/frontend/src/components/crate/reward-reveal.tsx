"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paintbrush, ShoppingBag, Flame, Coins, Sparkles } from "lucide-react";
import { rewardCardReveal } from "@/lib/animations";
import type { CrateOpenResult } from "@/types";

const RARITY_VARIANTS: Record<string, "common" | "uncommon" | "rare" | "epic" | "legendary"> = {
  COMMON: "common",
  UNCOMMON: "uncommon",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
};

const RARITY_BG: Record<string, string> = {
  COMMON: "from-zinc-500/20 to-zinc-600/5 ring-zinc-400/30",
  UNCOMMON: "from-green-500/20 to-green-600/5 ring-green-400/30",
  RARE: "from-blue-500/20 to-blue-600/5 ring-blue-400/30",
  EPIC: "from-purple-500/25 to-purple-600/10 ring-purple-400/40",
  LEGENDARY: "from-amber-500/30 to-amber-600/10 ring-amber-400/50",
};

const RARITY_GLOW: Record<string, string> = {
  COMMON: "shadow-zinc-400/30",
  UNCOMMON: "shadow-green-400/40",
  RARE: "shadow-blue-400/40",
  EPIC: "shadow-purple-400/50",
  LEGENDARY: "shadow-amber-400/60",
};

const RARITY_TEXT: Record<string, string> = {
  COMMON: "text-zinc-300",
  UNCOMMON: "text-green-400",
  RARE: "text-blue-400",
  EPIC: "text-purple-400",
  LEGENDARY: "text-amber-400",
};

interface RewardRevealProps {
  result: CrateOpenResult;
  rarity: string;
  onEquip?: () => void;
  onSell?: () => void;
  onBurn?: () => void;
}

export function RewardReveal({ result, rarity, onEquip, onSell, onBurn }: RewardRevealProps) {
  const { rewardType, traitDefinition, pawsAmount } = result.reward;
  const rewardRarity = result.reward.rarity ?? rarity;
  const bg = RARITY_BG[rewardRarity] ?? RARITY_BG.COMMON;
  const glow = RARITY_GLOW[rewardRarity] ?? RARITY_GLOW.COMMON;
  const textColor = RARITY_TEXT[rewardRarity] ?? RARITY_TEXT.COMMON;

  return (
    <motion.div
      variants={rewardCardReveal}
      initial="hidden"
      animate="visible"
      className="flex w-full max-w-sm flex-col items-center gap-5"
    >
      {/* Rarity banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2"
      >
        <Sparkles className={`h-4 w-4 ${textColor}`} />
        <Badge variant={RARITY_VARIANTS[rewardRarity] ?? "common"} className="text-sm px-3 py-0.5">
          {rewardRarity}
        </Badge>
        <Sparkles className={`h-4 w-4 ${textColor}`} />
      </motion.div>

      {/* Reward card */}
      <motion.div
        className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-b ring-2 ${bg} p-1`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="rounded-xl bg-card/80 backdrop-blur-sm">
          {rewardType === "PAWS" ? (
            <PawsRewardContent amount={pawsAmount ?? 0} glow={glow} textColor={textColor} />
          ) : rewardType === "CUB" ? (
            <CubRewardContent glow={glow} />
          ) : (
            <TraitRewardContent
              name={traitDefinition?.name ?? "Unknown Trait"}
              imageUrl={traitDefinition?.imageUrl ?? ""}
              category={traitDefinition?.category ?? ""}
              glow={glow}
            />
          )}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex w-full gap-2"
      >
        {rewardType === "TRAIT" && onEquip && (
          <Button
            onClick={onEquip}
            className="flex-1 gap-2 bg-gradient-to-r from-pink-500/80 to-purple-500/80 text-white hover:from-pink-500 hover:to-purple-500"
          >
            <Paintbrush className="h-4 w-4" />
            Equip
          </Button>
        )}
        {onSell && (
          <Button
            variant="outline"
            onClick={onSell}
            className="flex-1 gap-2 border-white/10 hover:bg-white/10"
          >
            <ShoppingBag className="h-4 w-4" />
            Sell
          </Button>
        )}
        {onBurn && (
          <Button
            variant="outline"
            onClick={onBurn}
            className="flex-1 gap-2 border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300"
          >
            <Flame className="h-4 w-4" />
            Burn
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}

function PawsRewardContent({ amount, glow, textColor }: { amount: number; glow: string; textColor: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 py-10 shadow-2xl ${glow}`}>
      <motion.div
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Coins className={`h-16 w-16 ${textColor}`} />
      </motion.div>
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.3 }}
        className={`text-4xl font-bold tabular-nums ${textColor}`}
      >
        +{amount.toLocaleString()}
      </motion.span>
      <span className="text-sm font-semibold text-muted-foreground">PAWS</span>
    </div>
  );
}

function CubRewardContent({ glow }: { glow: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 py-10 shadow-2xl ${glow}`}>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-6xl"
      >
        🐻
      </motion.div>
      <span className="text-xl font-bold text-primary">New Cub!</span>
      <span className="text-sm text-muted-foreground">A new cub has joined your pack</span>
    </div>
  );
}

function TraitRewardContent({
  name,
  imageUrl,
  category,
  glow,
}: {
  name: string;
  imageUrl: string;
  category: string;
  glow: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <motion.div
        initial={{ rotateY: 90 }}
        animate={{ rotateY: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.3 }}
        className={`relative h-48 w-48 overflow-hidden rounded-xl shadow-2xl ${glow}`}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          unoptimized
          className="object-cover"
        />
      </motion.div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-primary">{name}</h3>
        {category && (
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {category}
          </span>
        )}
      </div>
    </div>
  );
}

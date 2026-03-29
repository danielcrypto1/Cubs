"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PawsDisplay } from "@/components/shared/paws-display";
import { Zap, TrendingUp, Star, ChevronRight } from "lucide-react";

export interface CubAgent {
  id: string;
  name: string;
  imageUrl: string;
  level: number;
  maxLevel: number;
  xp: number;
  xpToNext: number;
  rarity: string;
  pawsPerHour: number;
  totalEarned: number;
  traits: { name: string; bonus: string }[];
  status: "idle" | "working" | "cooldown";
  specialty: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  idle: { label: "Idle", color: "text-zinc-400", dot: "bg-zinc-400" },
  working: { label: "Earning", color: "text-green-400", dot: "bg-green-400" },
  cooldown: { label: "Resting", color: "text-amber-400", dot: "bg-amber-400" },
};

const RARITY_BORDER: Record<string, string> = {
  COMMON: "border-zinc-500/20",
  UNCOMMON: "border-green-500/20",
  RARE: "border-blue-500/20",
  EPIC: "border-purple-500/30",
  LEGENDARY: "border-amber-500/30",
};

const RARITY_VARIANTS: Record<string, "common" | "uncommon" | "rare" | "epic" | "legendary"> = {
  COMMON: "common",
  UNCOMMON: "uncommon",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
};

interface AgentCardProps {
  agent: CubAgent;
  onDeploy?: (agent: CubAgent) => void;
  onUpgrade?: (agent: CubAgent) => void;
}

export function AgentCard({ agent, onDeploy, onUpgrade }: AgentCardProps) {
  const status = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle;
  const border = RARITY_BORDER[agent.rarity] ?? RARITY_BORDER.COMMON;
  const xpPercent = Math.min((agent.xp / agent.xpToNext) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group overflow-hidden rounded-2xl border ${border} bg-card/50 backdrop-blur-sm transition-colors hover:border-white/20`}
    >
      {/* Agent avatar + level */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={agent.imageUrl}
          alt={agent.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Status indicator */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
          <motion.div
            animate={agent.status === "working" ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`h-2 w-2 rounded-full ${status.dot}`}
          />
          <span className={`text-[10px] font-semibold ${status.color}`}>{status.label}</span>
        </div>

        {/* Level badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
          <Star className="h-3 w-3 text-cubs-gold" />
          <span className="text-xs font-bold text-cubs-gold">Lv.{agent.level}</span>
        </div>

        {/* Rarity badge bottom-left */}
        <div className="absolute bottom-3 left-3">
          <Badge variant={RARITY_VARIANTS[agent.rarity] ?? "common"} className="text-[10px]">
            {agent.rarity}
          </Badge>
        </div>
      </div>

      {/* Info section */}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-primary">{agent.name}</h3>
            <p className="text-xs text-muted-foreground">{agent.specialty}</p>
          </div>
          <PawsDisplay balance={agent.pawsPerHour} size="sm" />
        </div>

        {/* XP bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>XP</span>
            <span>{agent.xp.toLocaleString()} / {agent.xpToNext.toLocaleString()}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-cubs-gold to-amber-400"
            />
          </div>
        </div>

        {/* Traits */}
        {agent.traits.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agent.traits.map((trait) => (
              <span
                key={trait.name}
                className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                <Zap className="h-2.5 w-2.5 text-cubs-gold" />
                {trait.name}: {trait.bonus}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{agent.totalEarned.toLocaleString()} PAWS earned</span>
          </div>
          <span className="text-cubs-gold">{agent.pawsPerHour}/hr</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {agent.status === "idle" && onDeploy && (
            <Button
              size="sm"
              onClick={() => onDeploy(agent)}
              className="flex-1 gap-1 bg-gradient-to-r from-green-500/80 to-emerald-500/80 text-white hover:from-green-500 hover:to-emerald-500"
            >
              <Zap className="h-3.5 w-3.5" />
              Deploy
            </Button>
          )}
          {agent.status === "working" && (
            <Button size="sm" variant="outline" className="flex-1 gap-1 border-green-500/20 text-green-400" disabled>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-3.5 w-3.5" />
              </motion.div>
              Working...
            </Button>
          )}
          {onUpgrade && agent.level < agent.maxLevel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpgrade(agent)}
              className="gap-1 border-white/10 hover:bg-white/10"
            >
              <ChevronRight className="h-3.5 w-3.5" />
              Upgrade
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

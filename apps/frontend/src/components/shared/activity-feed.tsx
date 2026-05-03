"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingBag,
  Coins,
  Paintbrush,
  Award,
  Flame,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  type: "crate_open" | "trade" | "staking" | "equip" | "achievement" | "burn";
  user: string;
  message: string;
  rarity?: string;
  timestamp: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof Package; color: string }> = {
  crate_open: { icon: Package, color: "text-cubs-purple" },
  trade: { icon: ShoppingBag, color: "text-cubs-sky" },
  staking: { icon: Coins, color: "text-cubs-green" },
  equip: { icon: Paintbrush, color: "text-cubs-pink" },
  achievement: { icon: Award, color: "text-cubs-gold" },
  burn: { icon: Flame, color: "text-cubs-orange" },
};

const RARITY_VARIANTS: Record<string, "common" | "uncommon" | "rare" | "epic" | "legendary"> = {
  COMMON: "common", UNCOMMON: "uncommon", RARE: "rare", EPIC: "epic", LEGENDARY: "legendary",
};

// Mock feed — will be replaced with websocket/SSE in production
const MOCK_ACTIVITY: ActivityItem[] = [
  { id: "1", type: "crate_open", user: "0x1a2b...3c4d", message: "opened a Legendary Crate and found", rarity: "EPIC", timestamp: "2m ago" },
  { id: "2", type: "trade", user: "0x5e6f...7a8b", message: "bought Shadow Cub #42 for 0.05 ETH", timestamp: "5m ago" },
  { id: "3", type: "staking", user: "0x9c0d...1e2f", message: "claimed 1,240 PAWS from 3 cubs", timestamp: "8m ago" },
  { id: "4", type: "equip", user: "0x3a4b...5c6d", message: "equipped Laser Eyes on Cub #17", rarity: "LEGENDARY", timestamp: "12m ago" },
  { id: "5", type: "achievement", user: "0x7e8f...9a0b", message: "unlocked Pack Leader badge", timestamp: "15m ago" },
  { id: "6", type: "crate_open", user: "0xab12...cd34", message: "opened a Rare Crate and found", rarity: "RARE", timestamp: "18m ago" },
  { id: "7", type: "burn", user: "0xef56...7890", message: "burned Cub #88 and received 500 PAWS", timestamp: "22m ago" },
  { id: "8", type: "trade", user: "0x1234...5678", message: "listed Crown for 300 PAWS", timestamp: "25m ago" },
];

interface ActivityFeedProps {
  maxItems?: number;
  compact?: boolean;
}

export function ActivityFeed({ maxItems = 6, compact = false }: ActivityFeedProps) {
  const items = MOCK_ACTIVITY.slice(0, maxItems);

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => {
          const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.trade;
          const Icon = cfg.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm transition-colors hover:bg-white/10 ${compact ? "px-3 py-2" : "px-4 py-3"}`}
            >
              <div className={`mt-0.5 rounded-lg bg-white/10 p-1.5 ${cfg.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`${compact ? "text-xs" : "text-sm"} leading-snug`}>
                  <span className="font-semibold text-primary">{item.user}</span>{" "}
                  <span className="text-muted-foreground">{item.message}</span>
                  {item.rarity && (
                    <Badge
                      variant={RARITY_VARIANTS[item.rarity] ?? "common"}
                      className="ml-1.5 text-[10px]"
                    >
                      {item.rarity}
                    </Badge>
                  )}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{item.timestamp}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { springBouncy } from "@/lib/animations";
import { Layers, Heart, Paintbrush, Flame, ArrowRightLeft, Anvil } from "lucide-react";
import type { DashboardTab } from "@/types";

const TABS: { id: DashboardTab; label: string; icon: typeof Layers }[] = [
  { id: "collection", label: "My NFTs", icon: Layers },
  { id: "forge", label: "Cub Forge", icon: Anvil },
  { id: "breed", label: "Breed", icon: Heart },
  { id: "modify", label: "Modify", icon: Paintbrush },
  { id: "mint-burn", label: "Mint & Burn", icon: Flame },
  { id: "bridge", label: "Bridge", icon: ArrowRightLeft },
];

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="relative flex gap-1 overflow-x-auto rounded-2xl bg-secondary/50 p-1.5 scrollbar-none">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="dashboard-tab-bg"
                className="absolute inset-0 rounded-xl bg-primary"
                transition={springBouncy}
              />
            )}
            <tab.icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

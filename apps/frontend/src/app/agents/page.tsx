"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { AgentCard, type CubAgent } from "@/components/agents/agent-card";
import { AgentStatsPanel } from "@/components/agents/agent-stats-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, staggerItem } from "@/lib/animations";

const MOCK_AGENTS: CubAgent[] = [
  {
    id: "agent-1",
    name: "Shadow Scout",
    imageUrl: "/images/cubs/cub-1.png",
    level: 5,
    maxLevel: 20,
    xp: 3200,
    xpToNext: 5000,
    rarity: "RARE",
    pawsPerHour: 45,
    totalEarned: 12_400,
    traits: [
      { name: "Stealth", bonus: "+15% PAWS" },
      { name: "Night Vision", bonus: "+10% speed" },
    ],
    status: "working",
    specialty: "Explorer",
  },
  {
    id: "agent-2",
    name: "Golden Guardian",
    imageUrl: "/images/cubs/cub-2.png",
    level: 8,
    maxLevel: 20,
    xp: 7800,
    xpToNext: 10000,
    rarity: "EPIC",
    pawsPerHour: 85,
    totalEarned: 34_200,
    traits: [
      { name: "Shield", bonus: "+25% defense" },
      { name: "Radiance", bonus: "+20% PAWS" },
      { name: "Leadership", bonus: "+5% team" },
    ],
    status: "working",
    specialty: "Guardian",
  },
  {
    id: "agent-3",
    name: "Frost Whisper",
    imageUrl: "/images/cubs/cub-3.png",
    level: 3,
    maxLevel: 20,
    xp: 1200,
    xpToNext: 3000,
    rarity: "UNCOMMON",
    pawsPerHour: 22,
    totalEarned: 4_100,
    traits: [
      { name: "Ice Touch", bonus: "+10% crit" },
    ],
    status: "idle",
    specialty: "Gatherer",
  },
  {
    id: "agent-4",
    name: "Inferno Rex",
    imageUrl: "/images/cubs/cub-4.png",
    level: 12,
    maxLevel: 20,
    xp: 14000,
    xpToNext: 18000,
    rarity: "LEGENDARY",
    pawsPerHour: 150,
    totalEarned: 88_500,
    traits: [
      { name: "Blazing Fury", bonus: "+35% PAWS" },
      { name: "Dragon Scales", bonus: "+30% defense" },
      { name: "Hoard Sense", bonus: "+15% loot" },
    ],
    status: "working",
    specialty: "Raider",
  },
  {
    id: "agent-5",
    name: "Moss Paw",
    imageUrl: "/images/cubs/cub-5.png",
    level: 1,
    maxLevel: 20,
    xp: 100,
    xpToNext: 1000,
    rarity: "COMMON",
    pawsPerHour: 8,
    totalEarned: 320,
    traits: [],
    status: "cooldown",
    specialty: "Forager",
  },
  {
    id: "agent-6",
    name: "Neon Drift",
    imageUrl: "/images/cubs/cub-6.png",
    level: 6,
    maxLevel: 20,
    xp: 4500,
    xpToNext: 6000,
    rarity: "RARE",
    pawsPerHour: 52,
    totalEarned: 15_800,
    traits: [
      { name: "Hologram", bonus: "+12% evasion" },
      { name: "Overclock", bonus: "+18% speed" },
    ],
    status: "idle",
    specialty: "Scout",
  },
];

type StatusFilter = "all" | "working" | "idle" | "cooldown";

export default function AgentsPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const agents = MOCK_AGENTS;

  const filtered = filter === "all"
    ? agents
    : agents.filter((a) => a.status === filter);

  const handleDeploy = (agent: CubAgent) => {
    // TODO: integrate with deploy endpoint
    console.log("Deploy agent:", agent.id);
  };

  const handleUpgrade = (agent: CubAgent) => {
    // TODO: integrate with upgrade endpoint
    console.log("Upgrade agent:", agent.id);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4">
      <PageHeader
        title="Cub Agents"
        description="Deploy your cubs as autonomous agents to earn PAWS around the clock"
      />

      {/* Stats overview */}
      <AgentStatsPanel agents={agents} />

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(["all", "working", "idle", "cooldown"] as StatusFilter[]).map((f) => {
          const count = f === "all" ? agents.length : agents.filter((a) => a.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {f === "all" ? "All" : f}
              <Badge variant="common" className="ml-1.5 text-[10px] px-1.5 py-0">
                {count}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Agents grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Agents"
          description="No cub agents match the selected filter."
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((agent) => (
            <motion.div key={agent.id} variants={staggerItem}>
              <AgentCard
                agent={agent}
                onDeploy={handleDeploy}
                onUpgrade={handleUpgrade}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

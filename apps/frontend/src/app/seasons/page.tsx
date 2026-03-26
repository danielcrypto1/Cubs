"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { MOCK_CURRENT_SEASON } from "@/lib/mock-data";
import { Snowflake, Gift, CalendarDays, Sparkles } from "lucide-react";

const RARITY_VARIANTS: Record<string, "common" | "uncommon" | "rare" | "epic" | "legendary"> = {
  COMMON: "common", UNCOMMON: "uncommon", RARE: "rare", EPIC: "epic", LEGENDARY: "legendary",
};

export default function SeasonsPage() {
  const season = MOCK_CURRENT_SEASON;
  const daysLeft = Math.ceil(
    (new Date(season.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="mx-auto max-w-7xl px-4">
      <PageHeader title="Seasons" description="Participate in seasonal events and earn exclusive rewards" />

      {/* Season Banner */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={staggerItem}>
          <Card className="overflow-hidden border-cubs-sky/30 cubs-glow-sky">
            <CardContent className="p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Snowflake className="h-6 w-6 text-cubs-sky" />
                    <Badge variant="rare">Active Season</Badge>
                  </div>
                  <h2 className="mt-3 text-section">{season.name}</h2>
                  <p className="mt-2 max-w-lg text-muted-foreground">{season.description}</p>
                  <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                    <span><CalendarDays className="mr-1 inline h-4 w-4" />{season.startDate} — {season.endDate}</span>
                    <span className="font-semibold text-cubs-sky">{daysLeft} days remaining</span>
                  </div>
                </div>

                {/* Progress ring */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative flex h-28 w-28 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                      <motion.circle
                        cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                        strokeLinecap="round"
                        className="text-cubs-sky"
                        stroke="currentColor"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - season.progress / 100) }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute text-2xl font-bold">{season.progress}%</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Season Progress</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Season Rewards */}
        <div className="mt-10">
          <h2 className="text-section mb-6 flex items-center gap-2">
            <Gift className="h-6 w-6 text-cubs-gold" /> Season Rewards
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {season.rewards.map((reward, i) => (
              <motion.div key={reward.name} variants={staggerItem}>
                <Card className="cubs-card-hover">
                  <CardContent className="p-5 text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                      <Gift className={`h-8 w-8 ${i === 0 ? "text-cubs-gold" : i === 1 ? "text-cubs-purple" : i === 2 ? "text-cubs-sky" : "text-cubs-green"}`} />
                    </div>
                    <h3 className="font-bold">{reward.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{reward.description}</p>
                    <Badge variant={RARITY_VARIANTS[reward.rarity] ?? "common"} className="mt-2">
                      {reward.rarity}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upcoming Traits */}
        <div className="mt-10">
          <h2 className="text-section mb-6 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-cubs-pink" /> Upcoming Traits
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {season.upcomingTraits.map((trait) => (
              <motion.div key={trait.name} variants={staggerItem}>
                <Card className="cubs-card-hover">
                  <CardContent className="p-5">
                    <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-muted">
                      <Sparkles className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-bold">{trait.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{trait.category}</Badge>
                      <Badge variant={RARITY_VARIANTS[trait.rarity] ?? "common"} className="text-xs">
                        {trait.rarity}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

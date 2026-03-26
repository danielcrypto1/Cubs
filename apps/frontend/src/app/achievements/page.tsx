"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingBackground } from "@/components/shared/floating-background";
import { Trophy, Star, Lock, Clock } from "lucide-react";
import { usePoints } from "@/hooks/use-points";

const PLACEHOLDER_ACHIEVEMENTS = [
  { id: "first-mint", title: "First Mint", description: "Mint your first Cub", points: 100, icon: Star, unlocked: false },
  { id: "collector", title: "Collector", description: "Own 5 Cubs", points: 250, icon: Trophy, unlocked: false },
  { id: "forger", title: "Forger", description: "Forge a new Cub in the Cub Forge", points: 500, icon: Star, unlocked: false },
  { id: "trader", title: "Trader", description: "Complete a marketplace trade", points: 200, icon: Star, unlocked: false },
  { id: "staker", title: "Staker", description: "Stake a Cub for 7 days", points: 300, icon: Star, unlocked: false },
  { id: "rare-finder", title: "Rare Finder", description: "Own a Cub with 80%+ rarity", points: 1000, icon: Trophy, unlocked: false },
];

export default function AchievementsPage() {
  const { balance } = usePoints();

  return (
    <div className="relative min-h-screen">
      <FloatingBackground count={6} />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <PageHeader
          title="Achievements"
          description="Complete challenges to earn points."
        />

        {/* Points from achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="inline-flex">
            <CardContent className="flex items-center gap-3 p-4">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Points from Achievements:</span>
              <span className="font-bold text-primary">{balance.earned.achievements.toLocaleString()}</span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievement grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLACEHOLDER_ACHIEVEMENTS.map((achievement, i) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="h-full opacity-60">
                <CardContent className="flex h-full flex-col items-center gap-3 p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <div className="mt-auto flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <Star className="h-3 w-3" />
                    {achievement.points} pts
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <Clock className="mr-1 inline h-4 w-4" />
          More achievements will be added as the platform grows.
        </motion.p>
      </div>
    </div>
  );
}

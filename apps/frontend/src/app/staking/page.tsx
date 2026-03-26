"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingBackground } from "@/components/shared/floating-background";
import { Coins, Star, Clock, Zap } from "lucide-react";
import { usePoints } from "@/hooks/use-points";

export default function StakingPage() {
  const { available, balance } = usePoints();

  return (
    <div className="relative min-h-screen">
      <FloatingBackground count={6} />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <PageHeader
          title="Staking"
          description="Stake your Cubs to earn points. Rarer cubs earn more."
        />

        {/* Points Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 grid gap-4 sm:grid-cols-3"
        >
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Points</p>
                <p className="text-2xl font-bold">{available.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <Zap className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">From Staking</p>
                <p className="text-2xl font-bold">{balance.earned.staking.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <Coins className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">{balance.total.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Staking area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mx-auto max-w-xl">
            <CardContent className="flex flex-col items-center gap-6 p-10 text-center">
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-500/10"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Coins className="h-10 w-10 text-green-400" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold">Staking Coming Soon</h2>
                <p className="mt-2 text-muted-foreground">
                  Connect your wallet and stake your Cubs to start earning points.
                  Rarer cubs earn points faster. Points can be spent on crates and items.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-4 py-2 text-sm text-green-400">
                <Clock className="h-4 w-4" />
                Connect Wallet to Begin
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

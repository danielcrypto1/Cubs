"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingBackground } from "@/components/shared/floating-background";
import { Coins, Rocket, Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TokenPage() {
  return (
    <div className="relative min-h-screen">
      <FloatingBackground count={6} />

      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <PageHeader
          title="CUBS Token"
          description="The utility token powering the Cubs ecosystem."
        />

        {/* Coming soon hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mx-auto max-w-xl overflow-hidden">
            <CardContent className="flex flex-col items-center gap-6 p-10">
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Coins className="h-10 w-10 text-primary" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold">Launching After Cubs NFT</h2>
                <p className="mt-2 text-muted-foreground">
                  The CUBS token will go live after the NFT collection launch.
                  Stay tuned for tokenomics, staking rewards, and more.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
                <Clock className="h-4 w-4" />
                Coming Soon
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info cards */}
        <motion.div
          className="mt-12 grid gap-6 sm:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            {
              icon: Rocket,
              title: "Utility Token",
              desc: "Used for minting, forging, trading, and governance across the Cubs platform.",
            },
            {
              icon: Coins,
              title: "Earn Rewards",
              desc: "Stake your Cubs NFTs to earn CUBS tokens. Rarer cubs earn more.",
            },
            {
              icon: Bell,
              title: "Get Notified",
              desc: "Follow our socials to be first to know when the token launches.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <item.icon className="h-8 w-8 text-muted-foreground" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

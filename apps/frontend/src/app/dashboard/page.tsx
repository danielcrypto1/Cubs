"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { FloatingBackground } from "@/components/shared/floating-background";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePoints } from "@/hooks/use-points";
import sampleCubs from "@/data/sample-cubs.json";
import {
  Star,
  Hammer,
  ShoppingBag,
  Coins,
  Package,
  User,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "cubs" | "inventory" | "profile";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("cubs");
  const { available, balance } = usePoints();
  const cubs = sampleCubs.filter((c) => c.type !== "oneofone");

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "cubs", label: "My Cubs", icon: Package },
    { id: "inventory", label: "Inventory", icon: Star },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="relative min-h-screen">
      <FloatingBackground count={6} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <PageHeader title="Dashboard" description="Manage your Cubs, inventory, and profile." />

        {/* Points + Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 grid gap-3 sm:grid-cols-4"
        >
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Points</p>
                <p className="text-lg font-bold">{available.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Package className="h-5 w-5 text-cubs-sky" />
              <div>
                <p className="text-xs text-muted-foreground">Cubs</p>
                <p className="text-lg font-bold">{cubs.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Coins className="h-5 w-5 text-cubs-green" />
              <div>
                <p className="text-xs text-muted-foreground">Staked</p>
                <p className="text-lg font-bold">0</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <ShoppingBag className="h-5 w-5 text-cubs-purple" />
              <div>
                <p className="text-xs text-muted-foreground">Listed</p>
                <p className="text-lg font-bold">0</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab Bar */}
        <div className="mb-6 inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="dashboard-tab"
                    className="absolute inset-0 rounded-md bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <tab.icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "cubs" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {cubs.map((cub) => (
              <motion.div key={cub.tokenId} whileHover={{ scale: 1.03 }}>
                <Card className="overflow-hidden">
                  <div className="aspect-square bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cub.imageUrl}
                      alt={cub.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">#{cub.tokenId}</span>
                      {cub.type === "onsie" && (
                        <Badge variant="outline" className="text-[10px]">Onsie</Badge>
                      )}
                    </div>
                    <div className="mt-2 flex gap-1">
                      <Button size="sm" variant="outline" className="flex-1 text-xs" asChild>
                        <Link href="/forge">Forge</Link>
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs" disabled>
                        Stake
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "inventory" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="mx-auto max-w-md">
              <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                <Package className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">No Items Yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Earn items from crates, achievements, or trading. Items can be applied to your Cubs to change traits and increase rarity.
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Open a Crate — Coming Soon
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card className="mx-auto max-w-md">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Wallet className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Connect Wallet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Connect your wallet to set a profile picture, showcase your top cubs, and track your points.
                  </p>
                </div>
                <Button>Connect Wallet</Button>
              </CardContent>
            </Card>

            {/* Points breakdown */}
            <Card className="mx-auto max-w-md">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Points Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: "Staking", value: balance.earned.staking },
                    { label: "Activity", value: balance.earned.activity },
                    { label: "Achievements", value: balance.earned.achievements },
                    { label: "Discord", value: balance.earned.discord },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value.toLocaleString()} pts</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-primary">{balance.total.toLocaleString()} pts</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

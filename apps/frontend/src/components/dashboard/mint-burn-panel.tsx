"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { springBouncy } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Sparkles, Flame } from "lucide-react";
import { BurnPanel } from "./burn-panel";
import type { MockCub } from "@/lib/mock-data";

interface MintBurnPanelProps {
  cubs: MockCub[];
  // Burn props
  burnSelectedCub: MockCub | null;
  burnStatus: string;
  burnRewards: { tokens: number; traitName: string | null } | null;
  onBurnSelectCub: (cubId: string) => void;
  onBurnConfirm: () => void;
  onBurnCancel: () => void;
  onBurnReset: () => void;
}

export function MintBurnPanel({
  cubs, burnSelectedCub, burnStatus, burnRewards,
  onBurnSelectCub, onBurnConfirm, onBurnCancel, onBurnReset,
}: MintBurnPanelProps) {
  const [subTab, setSubTab] = useState<"mint" | "burn">("mint");
  const [quantity, setQuantity] = useState(1);
  const price = 0.05;

  return (
    <div className="space-y-6">
      {/* Sub-tab toggle */}
      <div className="flex gap-1 rounded-xl bg-secondary/50 p-1 w-fit">
        {(["mint", "burn"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={cn(
              "relative rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              subTab === tab ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {subTab === tab && (
              <motion.div
                layoutId="mint-burn-tab"
                className="absolute inset-0 rounded-lg bg-primary"
                transition={springBouncy}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab === "mint" ? <Sparkles className="h-3.5 w-3.5" /> : <Flame className="h-3.5 w-3.5" />}
              {tab === "mint" ? "Mint" : "Burn"}
            </span>
          </button>
        ))}
      </div>

      {subTab === "mint" ? (
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Mint New Cubs</CardTitle>
              <p className="text-sm text-muted-foreground">
                Each Cub is generated with random traits on mint.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price per Cub</span>
                <span className="text-xl font-bold text-primary">{price} ETH</span>
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted-foreground">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                  <span className="w-12 text-center text-xl font-bold">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(5, quantity + 1))}>+</Button>
                  <div className="flex gap-1">
                    {[1, 3, 5].map((q) => (
                      <Button key={q} variant={quantity === q ? "default" : "secondary"} size="sm" onClick={() => setQuantity(q)}>
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted p-4">
                <span className="font-medium">Total</span>
                <span className="text-2xl font-bold text-primary">{(price * quantity).toFixed(2)} ETH</span>
              </div>

              <Button className="w-full" size="lg">
                <Sparkles className="mr-2 h-5 w-5" />
                Mint {quantity} Cub{quantity > 1 ? "s" : ""}
              </Button>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Supply</span>
                  <span className="font-semibold">2,847 / 10,000</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: "28.47%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <BurnPanel
          cubs={cubs}
          selectedCub={burnSelectedCub}
          status={burnStatus}
          rewards={burnRewards}
          onSelectCub={onBurnSelectCub}
          onConfirmBurn={onBurnConfirm}
          onCancel={onBurnCancel}
          onReset={onBurnReset}
        />
      )}
    </div>
  );
}

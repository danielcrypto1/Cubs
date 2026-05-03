"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { popIn } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { ArrowRightLeft, Check, Clock, Fuel, Lock, ArrowLeft, RotateCcw, ExternalLink } from "lucide-react";
import { SUPPORTED_CHAINS } from "@/lib/contracts";
import type { MockCub } from "@/lib/mock-data";

interface BridgePanelProps {
  cubs: MockCub[];
  selectedCub: MockCub | null;
  destChain: typeof SUPPORTED_CHAINS[number] | null;
  status: string;
  txHash: string | null;
  onSelectCub: (cubId: string) => void;
  onSelectChain: (chainId: string) => void;
  onBridge: () => void;
  onReset: () => void;
}

export function BridgePanel({ cubs, selectedCub, destChain, status, txHash, onSelectCub, onSelectChain, onBridge, onReset }: BridgePanelProps) {
  // Complete state
  if (status === "complete") {
    return (
      <motion.div initial="hidden" animate="visible" variants={popIn} className="flex flex-col items-center gap-6 py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cubs-green">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold">Bridge Complete!</h3>
        <p className="text-sm text-muted-foreground">
          {selectedCub?.name} has been bridged to {destChain?.name}.
        </p>
        {txHash && (
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 border border-border">
            <span className="text-xs font-mono text-muted-foreground">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Bridge Another
        </Button>
      </motion.div>
    );
  }

  // Bridging animation
  if (status === "bridging" || status === "confirming") {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <motion.div
          animate={{ x: [-20, 20, -20] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowRightLeft className="h-16 w-16 text-cubs-sky" />
        </motion.div>
        <p className="text-lg font-medium">
          {status === "confirming" ? "Confirming transaction..." : "Bridging in progress..."}
        </p>
        <p className="text-sm text-muted-foreground">
          {selectedCub?.name} → {destChain?.name}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Bridge your Cubs to other EVM chains. Select a Cub and a destination chain.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cub selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">1. Select a Cub</h3>
          {selectedCub ? (
            <Card className="overflow-hidden ring-2 ring-primary">
              <div className="flex items-center gap-3 p-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image src={selectedCub.imageUrl} alt={selectedCub.name} fill unoptimized className="object-cover" />
                </div>
                <div>
                  <p className="font-semibold">{selectedCub.name}</p>
                  <p className="text-xs text-muted-foreground">#{selectedCub.tokenId}</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={onReset}>
                  Change
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {cubs.map((cub) => (
                <Card
                  key={cub.id}
                  className="cursor-pointer cubs-card-hover"
                  onClick={() => onSelectCub(cub.id)}
                >
                  <div className="flex items-center gap-3 p-2.5">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={cub.imageUrl} alt={cub.name} fill unoptimized className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{cub.name}</p>
                      <p className="text-[10px] text-muted-foreground">#{cub.tokenId}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Chain selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">2. Destination Chain</h3>
          <div className="grid gap-2">
            {SUPPORTED_CHAINS.map((chain) => {
              const isSelected = destChain?.id === chain.id;
              const isDisabled = chain.status === "coming_soon";
              return (
                <Card
                  key={chain.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    isSelected && "ring-2 ring-primary",
                    isDisabled && "opacity-60",
                    !isDisabled && "cubs-card-hover",
                  )}
                  onClick={() => !isDisabled && onSelectChain(chain.id)}
                >
                  <div className="flex items-center gap-3 p-3">
                    <span className="text-2xl">{chain.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{chain.name}</p>
                        {isDisabled && (
                          <Badge variant="secondary" className="text-[9px]">
                            <Lock className="mr-1 h-2.5 w-2.5" /> Coming Soon
                          </Badge>
                        )}
                      </div>
                      <div className="mt-0.5 flex gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{chain.estimatedTime}</span>
                        <span className="flex items-center gap-1"><Fuel className="h-2.5 w-2.5" />{chain.estimatedGas}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-primary" />}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bridge button */}
      {selectedCub && destChain && destChain.status === "active" && (
        <div className="flex justify-center">
          <Button size="lg" onClick={onBridge}>
            <ArrowRightLeft className="mr-2 h-5 w-5" />
            Bridge {selectedCub.name} to {destChain.name}
          </Button>
        </div>
      )}
    </div>
  );
}

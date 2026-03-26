"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RewardReveal } from "./reward-reveal";
import { popIn } from "@/lib/animations";
import type { CrateDefinition, CrateOpenResult } from "@/types";

const RARITY_GLOW: Record<string, string> = {
  COMMON: "0 0 40px rgba(161,161,170,0.4)",
  UNCOMMON: "0 0 40px rgba(74,222,128,0.4)",
  RARE: "0 0 40px rgba(96,165,250,0.4)",
  EPIC: "0 0 50px rgba(192,132,252,0.5)",
  LEGENDARY: "0 0 60px rgba(251,191,36,0.6)",
};

interface CrateOpenModalProps {
  crateDefinition: CrateDefinition | null;
  isOpening: boolean;
  result: CrateOpenResult | null;
  onClose: () => void;
}

export function CrateOpenModal({
  crateDefinition,
  isOpening,
  result,
  onClose,
}: CrateOpenModalProps) {
  if (!crateDefinition) return null;

  const glow = RARITY_GLOW[crateDefinition.rarity] ?? RARITY_GLOW.COMMON;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={result ? onClose : undefined}
      >
        <motion.div
          variants={popIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="relative flex min-h-[400px] w-full max-w-md flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-card p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Opening animation */}
          {isOpening && !result && (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{
                  rotate: [0, -5, 5, -5, 5, 0],
                  scale: [1, 1.05, 0.95, 1.05, 0.95, 1],
                  boxShadow: [
                    glow,
                    glow.replace("40px", "60px").replace("50px", "70px").replace("60px", "80px"),
                    glow,
                    glow.replace("40px", "60px").replace("50px", "70px").replace("60px", "80px"),
                    glow,
                  ],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="relative h-48 w-48 overflow-hidden rounded-xl"
              >
                <Image
                  src={crateDefinition.imageUrl}
                  alt={crateDefinition.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </motion.div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sm text-muted-foreground"
              >
                Opening crate...
              </motion.p>
            </div>
          )}

          {/* Reward reveal */}
          {result && <RewardReveal result={result} />}

          {/* Close button (only after reveal) */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

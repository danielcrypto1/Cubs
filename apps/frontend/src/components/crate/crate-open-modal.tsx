"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RewardReveal } from "./reward-reveal";
import type { CrateDefinition, CrateOpenResult } from "@/types";

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
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
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
                  className="object-cover"
                />
              </motion.div>
              <p className="text-sm text-muted-foreground">Opening crate...</p>
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

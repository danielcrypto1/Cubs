"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import { RewardReveal } from "./reward-reveal";
import {
  crateShake,
  crateGlow,
  crateFlash,
  CRATE_STAGE_TIMING,
} from "@/lib/animations";
import type { CrateDefinition, CrateOpenResult } from "@/types";

type AnimStage = "idle" | "shake" | "glow" | "flash" | "reveal";

const RARITY_PARTICLES: Record<string, string> = {
  COMMON: "bg-zinc-400",
  UNCOMMON: "bg-green-400",
  RARE: "bg-blue-400",
  EPIC: "bg-purple-400",
  LEGENDARY: "bg-amber-400",
};

const RARITY_RING: Record<string, string> = {
  COMMON: "ring-zinc-400/40",
  UNCOMMON: "ring-green-400/40",
  RARE: "ring-blue-400/40",
  EPIC: "ring-purple-400/50",
  LEGENDARY: "ring-amber-400/60",
};

interface CrateOpenModalProps {
  crateDefinition: CrateDefinition | null;
  isOpening: boolean;
  result: CrateOpenResult | null;
  onClose: () => void;
  onEquip?: (result: CrateOpenResult) => void;
  onSell?: (result: CrateOpenResult) => void;
  onBurn?: (result: CrateOpenResult) => void;
}

export function CrateOpenModal({
  crateDefinition,
  isOpening,
  result,
  onClose,
  onEquip,
  onSell,
  onBurn,
}: CrateOpenModalProps) {
  const [stage, setStage] = useState<AnimStage>("idle");
  const [showParticles, setShowParticles] = useState(false);

  const rarity = crateDefinition?.rarity ?? "COMMON";
  const timing = CRATE_STAGE_TIMING[rarity] ?? CRATE_STAGE_TIMING.COMMON;
  const glowKeyframes = crateGlow[rarity.toLowerCase() as keyof typeof crateGlow] ?? crateGlow.common;

  // Drive animation stages when opening starts
  useEffect(() => {
    if (!isOpening || !crateDefinition) return;

    setStage("idle");
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Stage 1: Start shaking
    timers.push(setTimeout(() => setStage("shake"), 100));

    // Stage 2: Glow builds
    timers.push(setTimeout(() => {
      setStage("glow");
      setShowParticles(true);
    }, timing.shake));

    // Stage 3: Flash
    timers.push(setTimeout(() => setStage("flash"), timing.shake + timing.glow));

    return () => timers.forEach(clearTimeout);
  }, [isOpening, crateDefinition, timing]);

  // Transition to reveal when result arrives and flash is done
  useEffect(() => {
    if (!result) return;
    const delay = stage === "flash" ? timing.flash : 200;
    const t = setTimeout(() => {
      setStage("reveal");
      setShowParticles(false);
    }, delay);
    return () => clearTimeout(t);
  }, [result, stage, timing.flash]);

  const handleClose = useCallback(() => {
    setStage("idle");
    setShowParticles(false);
    onClose();
  }, [onClose]);

  if (!crateDefinition) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
        onClick={stage === "reveal" ? handleClose : undefined}
      >
        {/* Close button */}
        {stage === "reveal" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative flex min-h-[480px] w-full max-w-lg flex-col items-center justify-center gap-6 p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Crate animation (idle → shake → glow → flash) ── */}
          {stage !== "reveal" && (
            <div className="relative flex flex-col items-center gap-6">
              {/* Particle ring */}
              {showParticles && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1.5, 0.5],
                        x: Math.cos((i * Math.PI * 2) / 12) * 120,
                        y: Math.sin((i * Math.PI * 2) / 12) * 120,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut",
                      }}
                      className={`absolute h-2 w-2 rounded-full ${RARITY_PARTICLES[rarity] ?? RARITY_PARTICLES.COMMON}`}
                    />
                  ))}
                </div>
              )}

              {/* Crate image */}
              <motion.div
                variants={crateShake}
                initial="idle"
                animate={
                  stage === "shake"
                    ? "shaking"
                    : stage === "glow"
                      ? "shaking_intense"
                      : "idle"
                }
                className={`relative h-52 w-52 overflow-hidden rounded-2xl ring-4 ${RARITY_RING[rarity] ?? RARITY_RING.COMMON}`}
              >
                {/* Glow overlay */}
                {(stage === "glow" || stage === "flash") && (
                  <motion.div
                    animate={glowKeyframes}
                    transition={{ duration: timing.glow / 1000, ease: "easeIn" }}
                    className="absolute inset-0 z-10 rounded-2xl"
                  />
                )}

                <Image
                  src={crateDefinition.imageUrl}
                  alt={crateDefinition.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </motion.div>

              {/* Stage label */}
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-sm font-medium text-muted-foreground"
              >
                {stage === "idle" && "Preparing crate..."}
                {stage === "shake" && "Something's stirring..."}
                {stage === "glow" && "Energy building..."}
                {stage === "flash" && "Here it comes!"}
              </motion.p>
            </div>
          )}

          {/* ── White flash overlay ── */}
          {stage === "flash" && (
            <motion.div
              variants={crateFlash}
              initial="hidden"
              animate="flash"
              className="pointer-events-none absolute inset-0 z-20 rounded-3xl bg-white"
            />
          )}

          {/* ── Reward reveal ── */}
          {stage === "reveal" && result && (
            <RewardReveal
              result={result}
              rarity={rarity}
              onEquip={onEquip ? () => onEquip(result) : undefined}
              onSell={onSell ? () => onSell(result) : undefined}
              onBurn={onBurn ? () => onBurn(result) : undefined}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

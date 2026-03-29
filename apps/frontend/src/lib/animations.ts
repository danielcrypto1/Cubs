import type { Variants, Transition } from "framer-motion";

/* ── Spring presets ──────────────────────────────────────────────────
   Consistent bounce/spring physics across the whole platform.
───────────────────────────────────────────────────────────────────── */

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 15,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 20,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

/* ── Fade + slide variants ──────────────────────────────────────── */

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springGentle },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: springGentle },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: springBouncy },
};

/* ── Stagger container ──────────────────────────────────────────── */

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: springGentle },
};

/* ── Interactive hover/tap ──────────────────────────────────────── */

export const hoverBounce = {
  whileHover: { y: -4, transition: springBouncy },
  whileTap: { scale: 0.96, transition: springSnappy },
};

export const hoverGlow = {
  whileHover: { y: -2, boxShadow: "0 0 24px oklch(0.82 0.17 80 / 0.15)" },
  whileTap: { scale: 0.97 },
};

/* ── Page transition ────────────────────────────────────────────── */

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

/* ── Pop (for modals, crate opening, rewards) ───────────────────── */

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...springBouncy, stiffness: 300 },
  },
};

/* ── Wiggle (for playful micro-interactions) ────────────────────── */

export const wiggle: Variants = {
  idle: { rotate: 0 },
  wiggle: {
    rotate: [0, -3, 3, -2, 2, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

/* ── Phase 6: Floating / drifting (background decorations) ─────── */

export const floatY: Variants = {
  animate: {
    y: [0, -20, 0],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  },
};

export const floatRotate: Variants = {
  animate: {
    rotate: [0, 5, -5, 0],
    y: [0, -15, 0],
    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
  },
};

/* ── Phase 6: Enhanced card hover with glow ────────────────────── */

export const hoverLiftGlow = {
  whileHover: {
    y: -6,
    boxShadow: "0 12px 32px oklch(0 0 0 / 0.3), 0 0 24px oklch(0.82 0.17 80 / 0.12)",
    transition: springBouncy,
  },
  whileTap: { scale: 0.97, transition: springSnappy },
};

/* ── Phase 6: Button glow pulse ────────────────────────────────── */

export const buttonGlow: Variants = {
  idle: { boxShadow: "0 0 0px oklch(0.82 0.17 80 / 0)" },
  glow: {
    boxShadow: [
      "0 0 8px oklch(0.82 0.17 80 / 0.15)",
      "0 0 24px oklch(0.82 0.17 80 / 0.25)",
      "0 0 8px oklch(0.82 0.17 80 / 0.15)",
    ],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

/* ── Phase 6: Crate idle bob ───────────────────────────────────── */

export const crateIdle: Variants = {
  idle: {
    y: [0, -4, 0],
    rotate: [0, 1, -1, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

/* ── Crate opening stages ─────────────────────────────────────── */

export const crateShake: Variants = {
  idle: { rotate: 0, x: 0 },
  shaking: {
    rotate: [0, -6, 6, -8, 8, -10, 10, -6, 6, 0],
    x: [0, -3, 3, -4, 4, -5, 5, -3, 3, 0],
    transition: { duration: 0.8, ease: "easeInOut" },
  },
  shaking_intense: {
    rotate: [0, -10, 10, -14, 14, -18, 18, -14, 14, -10, 10, 0],
    x: [0, -5, 5, -7, 7, -9, 9, -7, 7, -5, 5, 0],
    scale: [1, 1.02, 0.98, 1.03, 0.97, 1.04, 0.96, 1.02, 0.98, 1],
    transition: { duration: 1.2, ease: "easeInOut" },
  },
};

export const crateGlow = {
  common: {
    boxShadow: [
      "0 0 20px rgba(161,161,170,0.2)",
      "0 0 60px rgba(161,161,170,0.6)",
      "0 0 80px rgba(161,161,170,0.8)",
    ],
  },
  uncommon: {
    boxShadow: [
      "0 0 20px rgba(74,222,128,0.2)",
      "0 0 60px rgba(74,222,128,0.6)",
      "0 0 100px rgba(74,222,128,0.8)",
    ],
  },
  rare: {
    boxShadow: [
      "0 0 20px rgba(96,165,250,0.2)",
      "0 0 60px rgba(96,165,250,0.6)",
      "0 0 100px rgba(96,165,250,0.8)",
    ],
  },
  epic: {
    boxShadow: [
      "0 0 20px rgba(192,132,252,0.2)",
      "0 0 80px rgba(192,132,252,0.6)",
      "0 0 120px rgba(192,132,252,0.9)",
    ],
  },
  legendary: {
    boxShadow: [
      "0 0 30px rgba(251,191,36,0.3)",
      "0 0 100px rgba(251,191,36,0.7)",
      "0 0 150px rgba(251,191,36,1.0)",
    ],
  },
};

export const crateFlash: Variants = {
  hidden: { opacity: 0, scale: 1 },
  flash: {
    opacity: [0, 1, 1, 0],
    scale: [1, 1.5, 2, 2.5],
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const rewardCardReveal: Variants = {
  hidden: { opacity: 0, scale: 0.3, rotateY: 180 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: { type: "spring", stiffness: 180, damping: 14, delay: 0.2 },
  },
};

/** Timing per rarity tier (milliseconds) */
export const CRATE_STAGE_TIMING: Record<string, { shake: number; glow: number; flash: number; total: number }> = {
  COMMON:    { shake: 600,  glow: 400,  flash: 400, total: 1400 },
  UNCOMMON:  { shake: 800,  glow: 500,  flash: 400, total: 1700 },
  RARE:      { shake: 1000, glow: 600,  flash: 500, total: 2100 },
  EPIC:      { shake: 1200, glow: 800,  flash: 500, total: 2500 },
  LEGENDARY: { shake: 1600, glow: 1000, flash: 600, total: 3200 },
};

/* ── Phase 6: Section reveal (dramatic entrance) ───────────────── */

export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 22, duration: 0.6 },
  },
};

/* ── Phase 6: Parallax scroll offset ───────────────────────────── */

export const parallaxSlow: Variants = {
  hidden: { y: 30 },
  visible: { y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

/* ── Phase 7: Map location beacon pulse ──────────────────────────── */

export const mapLocationPulse = {
  animate: {
    boxShadow: [
      "0 0 8px oklch(0.82 0.17 80 / 0.2)",
      "0 0 24px oklch(0.82 0.17 80 / 0.4)",
      "0 0 8px oklch(0.82 0.17 80 / 0.2)",
    ],
    scale: [1, 1.05, 1],
  },
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

/* ── Phase 7: Map zoom-in on click ───────────────────────────────── */

export const mapZoomIn: Variants = {
  idle: { scale: 1, opacity: 1 },
  zooming: {
    scale: 1.8,
    opacity: 0,
    transition: { duration: 0.6, ease: "easeIn" },
  },
};

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

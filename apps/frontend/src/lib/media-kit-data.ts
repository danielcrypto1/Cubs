import type { BackgroundPreset, OverlayAsset, FontOption, GradientConfig } from "@/types";

// ─── Overlay Assets ──────────────────────────────────────────────────────

export const MOCK_OVERLAYS: OverlayAsset[] = [
  {
    id: "overlay-frame-gold",
    name: "Gold Frame",
    imageUrl: "https://placehold.co/512x512/f59e0b/ffffff?text=Gold+Frame",
    thumbnailUrl: "https://placehold.co/100x100/f59e0b/ffffff?text=Frame",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  {
    id: "overlay-crown",
    name: "Crown",
    imageUrl: "https://placehold.co/256x256/f59e0b/ffffff?text=Crown",
    thumbnailUrl: "https://placehold.co/100x100/f59e0b/ffffff?text=Crown",
    defaultWidth: 200,
    defaultHeight: 150,
  },
  {
    id: "overlay-sparkle",
    name: "Sparkles",
    imageUrl: "https://placehold.co/512x512/fbbf24/ffffff?text=Sparkles",
    thumbnailUrl: "https://placehold.co/100x100/fbbf24/ffffff?text=Sparkle",
    defaultWidth: 300,
    defaultHeight: 300,
  },
  {
    id: "overlay-badge-verified",
    name: "Verified Badge",
    imageUrl: "https://placehold.co/128x128/3b82f6/ffffff?text=Verified",
    thumbnailUrl: "https://placehold.co/100x100/3b82f6/ffffff?text=Badge",
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: "overlay-banner-ribbon",
    name: "Ribbon Banner",
    imageUrl: "https://placehold.co/400x120/ef4444/ffffff?text=Ribbon",
    thumbnailUrl: "https://placehold.co/100x100/ef4444/ffffff?text=Ribbon",
    defaultWidth: 400,
    defaultHeight: 120,
  },
  {
    id: "overlay-heart",
    name: "Heart",
    imageUrl: "https://placehold.co/200x200/ec4899/ffffff?text=Heart",
    thumbnailUrl: "https://placehold.co/100x100/ec4899/ffffff?text=Heart",
    defaultWidth: 150,
    defaultHeight: 150,
  },
  {
    id: "overlay-star",
    name: "Star",
    imageUrl: "https://placehold.co/200x200/eab308/ffffff?text=Star",
    thumbnailUrl: "https://placehold.co/100x100/eab308/ffffff?text=Star",
    defaultWidth: 150,
    defaultHeight: 150,
  },
  {
    id: "overlay-lightning",
    name: "Lightning",
    imageUrl: "https://placehold.co/150x300/a855f7/ffffff?text=Bolt",
    thumbnailUrl: "https://placehold.co/100x100/a855f7/ffffff?text=Bolt",
    defaultWidth: 120,
    defaultHeight: 240,
  },
];

// ─── Gradient Presets ────────────────────────────────────────────────────

const GRADIENT_SUNSET: GradientConfig = {
  type: "linear",
  angle: 135,
  stops: [
    { color: "#f97316", position: 0 },
    { color: "#ec4899", position: 0.5 },
    { color: "#8b5cf6", position: 1 },
  ],
};

const GRADIENT_OCEAN: GradientConfig = {
  type: "linear",
  angle: 180,
  stops: [
    { color: "#06b6d4", position: 0 },
    { color: "#3b82f6", position: 0.5 },
    { color: "#1e3a5f", position: 1 },
  ],
};

const GRADIENT_FOREST: GradientConfig = {
  type: "linear",
  angle: 160,
  stops: [
    { color: "#065f46", position: 0 },
    { color: "#10b981", position: 0.5 },
    { color: "#d9f99d", position: 1 },
  ],
};

// ─── Background Presets ──────────────────────────────────────────────────

export const MOCK_BACKGROUNDS: BackgroundPreset[] = [
  // Solid Colors
  {
    id: "bg-dark",
    name: "Dark",
    type: "solid",
    value: "#0f172a",
  },
  {
    id: "bg-teal",
    name: "Teal",
    type: "solid",
    value: "#134e4a",
  },
  {
    id: "bg-gold",
    name: "Gold",
    type: "solid",
    value: "#92400e",
  },
  // Gradients
  {
    id: "bg-sunset",
    name: "Sunset",
    type: "gradient",
    value: "linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)",
    gradient: GRADIENT_SUNSET,
  },
  {
    id: "bg-ocean",
    name: "Ocean",
    type: "gradient",
    value: "linear-gradient(180deg, #06b6d4, #3b82f6, #1e3a5f)",
    gradient: GRADIENT_OCEAN,
  },
  {
    id: "bg-forest",
    name: "Forest",
    type: "gradient",
    value: "linear-gradient(160deg, #065f46, #10b981, #d9f99d)",
    gradient: GRADIENT_FOREST,
  },
  // Patterns
  {
    id: "bg-leopard",
    name: "Leopard",
    type: "pattern",
    value: "leopard",
    thumbnailUrl: "https://placehold.co/100x100/134e4a/5eead4?text=Leopard",
  },
  {
    id: "bg-checkerboard",
    name: "Checker",
    type: "pattern",
    value: "checkerboard",
    thumbnailUrl: "https://placehold.co/100x100/1a1a2e/2a2a4e?text=Check",
  },
  {
    id: "bg-dots",
    name: "Dots",
    type: "pattern",
    value: "dots",
    thumbnailUrl: "https://placehold.co/100x100/1e293b/475569?text=Dots",
  },
  {
    id: "bg-stripes",
    name: "Stripes",
    type: "pattern",
    value: "stripes",
    thumbnailUrl: "https://placehold.co/100x100/1e293b/334155?text=Stripes",
  },
];

// ─── Font Options ────────────────────────────────────────────────────────

export const MOCK_FONTS: FontOption[] = [
  { family: "Nunito", label: "Nunito" },
  { family: "Lilita One", label: "Lilita One" },
  { family: "Arial", label: "Arial" },
  { family: "Georgia", label: "Georgia" },
  { family: "Courier New", label: "Courier" },
];

// ─── Color Swatches for Text ─────────────────────────────────────────────

export const TEXT_COLORS = [
  "#ffffff",
  "#000000",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#10b981",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

// ─── Canvas Dimensions ──────────────────────────────────────────────────

export const CANVAS_DIMENSIONS = {
  pfp: { width: 1024, height: 1024 },
  banner: { width: 1500, height: 500 },
} as const;

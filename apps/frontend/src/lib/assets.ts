/**
 * Asset system for CUBS platform.
 *
 * When real assets land in /public/assets/, set USE_PLACEHOLDERS to false
 * and the resolver will return the actual file paths instead.
 */

const USE_PLACEHOLDERS = true;

export function resolveAsset(path: string, fallbackText: string, size = "200x200"): string {
  if (USE_PLACEHOLDERS) {
    return `https://placehold.co/${size}/1a1a2e/f59e0b?text=${encodeURIComponent(fallbackText)}`;
  }
  return path;
}

/* ── Floating cub images (used by FloatingBackground) ──────────── */
export const FLOATING_CUB_IMAGES = Array.from({ length: 8 }, (_, i) => `/assets/cubs/float-${i + 1}.png`);

/* ── Scene backgrounds (used by SceneSection) ──────────────────── */
export const SCENE_BACKGROUNDS: Record<string, string> = {
  playground: resolveAsset("/assets/scenes/playground.png", "Playground", "800x400"),
  market: resolveAsset("/assets/scenes/market.png", "Market", "800x400"),
  vault: resolveAsset("/assets/scenes/vault.png", "Vault", "800x400"),
  labs: resolveAsset("/assets/scenes/labs.png", "Labs", "800x400"),
};

/* ── Scene tint colours (oklch values matching brand) ──────────── */
export const SCENE_TINTS: Record<string, string> = {
  playground: "oklch(0.82 0.17 80 / 0.03)",   // gold
  market: "oklch(0.72 0.15 230 / 0.03)",       // sky
  vault: "oklch(0.72 0.18 155 / 0.03)",        // green
  labs: "oklch(0.65 0.2 300 / 0.03)",          // purple
};

/* ── Cursor assets ─────────────────────────────────────────────── */
export const CURSOR_ASSETS = {
  default: "/assets/cursors/cub-default.png",
  pointer: "/assets/cursors/cub-pointer.png",
};

/* ── Map assets (Phase 7) ──────────────────────────────────────── */

export const MAP_BACKGROUND = resolveAsset(
  "/assets/map/world-map-bg.png",
  "Cub+World",
  "1600x900",
);

const MAP_ICON_COLORS: Record<string, string> = {
  city: "f59e0b",
  playground: "f472b6",
  market: "60a5fa",
  labs: "a78bfa",
  vault: "34d399",
};

export const MAP_LOCATION_ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(MAP_ICON_COLORS).map(([key, color]) => [
    key,
    resolveAsset(`/assets/map/icon-${key}.png`, key.charAt(0).toUpperCase() + key.slice(1), "80x80").replace(
      "1a1a2e/f59e0b",
      `1a1a2e/${color}`,
    ),
  ]),
);

export const MAP_DECORATIONS = {
  cloud1: resolveAsset("/assets/map/cloud-1.png", "Cloud", "120x60"),
  cloud2: resolveAsset("/assets/map/cloud-2.png", "Cloud", "100x50"),
  tree1: resolveAsset("/assets/map/tree-1.png", "Tree", "60x80"),
  tree2: resolveAsset("/assets/map/tree-2.png", "Tree", "50x70"),
  mountain: resolveAsset("/assets/map/mountain.png", "Mountain", "140x100"),
};

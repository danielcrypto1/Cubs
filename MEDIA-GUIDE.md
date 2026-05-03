# CUBS Platform — Media Asset Guide

Everything you need to create for the website, with exact dimensions and formats.

---

## Quick Reference — Dimensions at a Glance

| Asset | Dimensions | Format | Priority |
|-------|-----------|--------|----------|
| Homepage Hero | 400x400 | PNG (transparent) | HIGH |
| Scene Backgrounds (x4) | 800x400 | PNG/JPG | HIGH |
| World Map Background | 1600x900 | PNG/JPG | HIGH |
| Map Location Icons (x5) | 80x80 | PNG (transparent) | MEDIUM |
| Map Decorations (x5) | varies (see below) | PNG (transparent) | LOW |
| Cursor — Pointer | 40x40 | PNG (transparent) | MEDIUM |
| Cub Card Images (x6) | 400x400 | PNG (transparent) | HIGH |
| Trait Images (x39) | 1024x1024 | PNG (transparent) | MEDIUM |
| Crate Images (x4) | 400x400 | PNG (transparent) | MEDIUM |
| Editor Overlays (x8) | varies (see below) | PNG (transparent) | LOW |
| Editor Scene BGs (x4) | 1024x1024 | JPG | LOW |
| Favicon | 32x32 + 16x16 | PNG/ICO | HIGH |
| OG Social Image | 1200x630 | PNG/JPG | HIGH |

---

## 1. Homepage Hero Image
- **Size:** 400x400px
- **Format:** PNG with transparent background
- **What to make:** A showcase Cub (your best looking bear) — this is the first thing visitors see
- **Used on:** Homepage, floating/bobbing animation
- **File:** `public/assets/cubs/hero.png`

## 2. Scene Backgrounds (4 needed)
These appear at ~7% opacity behind page sections. They add texture/atmosphere, not detail.

| Scene | Size | Color Tint | Used On | File |
|-------|------|-----------|---------|------|
| Playground | 800x400 | Gold | Hero + Features section | `public/assets/scenes/playground.png` |
| Market | 800x400 | Blue | Cub Showcase + Marketplace section | `public/assets/scenes/market.png` |
| Vault | 800x400 | Green | Token Metrics section | `public/assets/scenes/vault.png` |
| Labs | 800x400 | Purple | CTA section | `public/assets/scenes/labs.png` |

**Tip:** These can be abstract/painterly since they show at very low opacity. Think landscapes, cityscapes, forests — the vibe of each zone.

## 3. World Map
- **Background:** 1600x900px — an illustrated top-down world map with 5 labeled zones
- **Style:** Cartoon/illustrated, matches the playful CUBS brand

### Map Location Icons (5 needed)
| Location | Size | Color | Navigates To |
|----------|------|-------|-------------|
| Cub City | 80x80 | Orange #f59e0b | /mint |
| Cub Playground | 80x80 | Pink #f472b6 | /editor |
| Cub Market | 80x80 | Blue #60a5fa | /marketplace |
| Cub Labs | 80x80 | Purple #a78bfa | /crates |
| Cub Vault | 80x80 | Teal #34d399 | /staking |

### Map Decorations (5 needed — low priority)
| Element | Size |
|---------|------|
| Cloud 1 | 120x60 |
| Cloud 2 | 100x50 |
| Tree 1 | 60x80 |
| Tree 2 | 50x70 |
| Mountain | 140x100 |

## 4. Cursor
- **Default (exists):** `public/assets/cursors/cub-default.png` (32x32) — DONE
- **Pointer (needed):** `public/assets/cursors/cub-pointer.png` (40x40) — a paw pointing/clicking variant

## 5. Cub Card Images (6 needed)
Sample Cubs shown on the homepage, My Cubs page, and staking page.

| Name | Size | Suggested Style |
|------|------|----------------|
| Blaze | 400x400 | Gold/fire themed bear |
| Frost | 400x400 | Ice/blue themed bear |
| Blossom | 400x400 | Pink/flower themed bear |
| Shadow | 400x400 | Purple/dark themed bear |
| Clover | 400x400 | Green/lucky themed bear |
| Ember | 400x400 | Orange/warm themed bear |

**Format:** PNG with transparent background
**Tip:** These are your showcase cubs — make them look great!

## 6. Trait Images (39 needed)
Individual trait layers that can be applied to Cubs in the editor.

| Category | Traits | Size |
|----------|--------|------|
| Background (3) | Sunset, Arctic, Meadow | 1024x1024 |
| Body (3) | Golden, Ice Blue, Pink | 1024x1024 |
| Outfit (3) | Scarf, Armor, Hoodie | 1024x1024 |
| Shoes (3) | Sneakers, Boots, Sandals | 1024x1024 |
| Accessories (3) | Lucky Coin, Necklace, Watch | 1024x1024 |
| Hat (3) | Crown, Flower Crown, Shamrock | 1024x1024 |
| Eyes (3) | Sparkle, Frosty, Fire | 1024x1024 |
| Mouth (3) | Smile, Grin, Tongue Out | 1024x1024 |
| Special (3) | Shadow Aura, Sparkle FX, Flame Ring | 1024x1024 |

**Format:** PNG with transparent background (these layer on top of the base body)

## 7. Crate Images (4 needed)
| Crate | Size | Suggested Style |
|-------|------|----------------|
| Common | 400x400 | Simple wooden crate |
| Rare | 400x400 | Blue glowing crate |
| Epic | 400x400 | Purple glowing crate |
| Legendary | 400x400 | Gold glowing crate |

## 8. Editor Overlays (8 needed — low priority)
Decorative overlays for the Media Kit editor canvas.

| Overlay | Full Size | Thumbnail |
|---------|-----------|-----------|
| Gold Frame | 512x512 | 100x100 |
| Crown | 256x256 | 100x100 |
| Sparkles | 512x512 | 100x100 |
| Verified Badge | 128x128 | 100x100 |
| Ribbon Banner | 400x120 | 100x100 |
| Heart | 200x200 | 100x100 |
| Star | 200x200 | 100x100 |
| Lightning Bolt | 150x300 | 100x100 |

## 9. Editor Scene Backgrounds (4 needed — low priority)
Full-bleed backgrounds for the NFT canvas editor.

| Scene | Size | Style |
|-------|------|-------|
| Beach | 1024x1024 | Tropical beach scene |
| City | 1024x1024 | Urban cityscape |
| Forest | 1024x1024 | Enchanted forest |
| Space | 1024x1024 | Cosmic/galaxy |

## 10. Favicon & Social
| Asset | Size | File |
|-------|------|------|
| Favicon ICO | 32x32 + 16x16 | `public/favicon.ico` |
| Apple Touch Icon | 180x180 | `public/apple-touch-icon.png` |
| OG Image (social sharing) | 1200x630 | `public/og-image.png` |

---

## File Organization

Drop all files into:
```
public/
├── favicon.ico
├── apple-touch-icon.png
├── og-image.png
└── assets/
    ├── cubs/
    │   ├── hero.png              (400x400)
    │   └── float-1..8.png        (ALREADY EXIST)
    ├── cursors/
    │   ├── cub-default.png       (ALREADY EXISTS)
    │   └── cub-pointer.png       (40x40)
    ├── scenes/
    │   ├── playground.png        (800x400)
    │   ├── market.png            (800x400)
    │   ├── vault.png             (800x400)
    │   └── labs.png              (800x400)
    ├── map/
    │   ├── world-map-bg.png      (1600x900)
    │   ├── icon-city.png         (80x80)
    │   ├── icon-playground.png   (80x80)
    │   ├── icon-market.png       (80x80)
    │   ├── icon-labs.png         (80x80)
    │   ├── icon-vault.png        (80x80)
    │   ├── cloud-1.png           (120x60)
    │   ├── cloud-2.png           (100x50)
    │   ├── tree-1.png            (60x80)
    │   ├── tree-2.png            (50x70)
    │   └── mountain.png          (140x100)
    ├── traits/
    │   └── [39 trait PNGs]       (1024x1024 each)
    ├── crates/
    │   ├── common.png            (400x400)
    │   ├── rare.png              (400x400)
    │   ├── epic.png              (400x400)
    │   └── legendary.png         (400x400)
    └── overlays/
        └── [8 overlay PNGs]      (varies)
```

## Total Count

| Status | Count |
|--------|-------|
| Already done | 9 (8 floaters + 1 cursor) |
| High priority | 16 (hero, 4 scenes, map bg, 6 cubs, favicon, OG, apple icon) |
| Medium priority | 49 (5 map icons, pointer cursor, 39 traits, 4 crates) |
| Low priority | 18 (5 map decorations, 8 overlays, 4 editor scenes, twitter img) |
| **TOTAL** | **92** |

Once assets are ready, set `USE_PLACEHOLDERS = false` in `apps/frontend/src/lib/assets.ts` to switch from placeholder URLs to real files.

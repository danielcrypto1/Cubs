# CUBS Platform — Project Overview

## What is CUBS?

CUBS is a next-generation NFT ecosystem on Ethereum where users collect, customize, trade, and stake cartoon bear NFTs called "Cubs." The platform's core innovation is **composable traits** — every Cub is built from stackable layers (background, body, outfit, hat, eyes, accessories, mouth, shoes) that owners can swap, remove, and upgrade through the **Cub Forge**. This creates a dynamic rarity system where your Cub's value changes based on the traits you equip.

The collection consists of **3,333 Cubs** in three types:

- **Regular Cubs** (3,269) — 8 trait slots, fully customizable
- **Onsie Cubs** (50) — 5 trait slots (the onsie replaces outfit, hat, accessories, shoes)
- **1-of-1 Cubs** (14) — Unique hand-drawn pieces, not editable

Cubs are bred from **Bud Bears**, an existing NFT collection. Holders burn two Bud Bears to mint a new Cub.

---

## Platform Architecture

The platform is a **Turborepo monorepo** with three main packages:

| Package | Stack | Purpose |
|---------|-------|---------|
| `apps/frontend` | Next.js 15, TailwindCSS v4, Framer Motion, wagmi/RainbowKit | User-facing web application |
| `apps/backend` | Fastify 5, Prisma 6, BullMQ, Sharp | API server, game logic, image compositing |
| `packages/shared` | TypeScript | Shared types, constants, ABIs |

**Infrastructure:**
- PostgreSQL (database via Prisma ORM)
- Redis (caching, rate limiting, job queues via BullMQ)
- Alchemy (Ethereum RPC)
- Pinata (IPFS pinning for NFT images and metadata)
- Vercel (frontend hosting)

---

## Website Pages & Features

### Home Page (`/`)

Sky-themed landing page with animated floating Cubs in the background that react to cursor movement (zero-gravity physics simulation). Features a hero section with CTAs for minting and marketplace, a platform features grid, Cub showcase carousel, and a transition from sky to dark gradient.

### World Map (`/map`)

Interactive illustrated map with 5 clickable locations, each linking to a core feature:

| Location | Destination | Purpose |
|----------|-------------|---------|
| Cub City | `/mint` | Mint new Cubs |
| Cub Forge | `/forge` | Customize traits |
| Cub Market | `/marketplace` | Buy and sell |
| Cub Labs | `/crates` | Open loot crates |
| Cub Vault | `/staking` | Stake for PAWS |

Desktop shows an illustrated map with hover tooltips and zoom-to-navigate animation. Mobile shows a vertical card list.

### Dashboard (`/dashboard`)

User's command center with three tabs:

- **My Cubs** — Grid of owned Cubs with Forge and Stake action buttons
- **Inventory** — Traits and items collected from crates
- **Profile** — Wallet connection, points breakdown by source (staking, activity, achievements, Discord)

Stats bar shows: Available Points, Cubs count, Staked count, Listed count.

### Cub Forge (`/forge`)

The centerpiece feature. Users select a Cub from their wallet and customize its traits in real-time.

**How it works:**
1. Select a Cub from your wallet (1-of-1s are filtered out)
2. The canvas renders the Cub as stacked layers in real-time
3. For each trait category, browse available options with rarity percentages
4. The rarity score updates live as you swap traits, showing the delta (change)
5. When satisfied, "Forge" burns the old trait combination and mints the new one
6. A version snapshot is stored for history

**Layer system:**
- Regular Cubs: Background, Body, Outfit, Hat, Eyes, Accessories, Mouth, Shoes (8 layers)
- Onsie Cubs: Background, Body, Mouth, Onsie, Eyes (5 layers — the onsie is a full-body piece)

**Onsie rule:** Adding an onsie automatically removes outfit, hat, accessories, and shoes. Removing an onsie unlocks all 8 slots. You cannot have both an onsie and an outfit.

**Rarity system:** Each trait has a weight from the generation script. Rarer traits have lower weights. The rarity percentage is normalized between the minimum and maximum possible scores:

| Tier | Range |
|------|-------|
| Common | 0–25% |
| Uncommon | 25–50% |
| Rare | 50–75% |
| Epic | 75–90% |
| Legendary | 90–99% |
| Mythic | 99%+ |

A **rarity leaderboard** shows the top 10 highest-scoring Cubs.

### Marketplace (`/marketplace`)

Full trading platform with three mechanisms:

1. **Listings** — Fixed-price sales of Cubs, Traits, or Crates
2. **Offers** — Bid on listed items
3. **Trades** — Direct player-to-player asset swaps

**Filters:** Asset type, rarity, category, price range, sort order. Paginated (20 per page).

**Fee structure:**
- PAWS trades: 10% burned, remainder to seller
- ETH trades: 2.5% platform fee + 5% royalty
- Listing a Cub pauses its staking rewards

### Crates (`/crates`)

Loot box system with animated opening sequences.

**Pity system (guarantees rare drops):**
- Soft pity at 20 opens: 70% Epic / 30% Legendary weighted
- Hard pity at 50 opens: Guaranteed Legendary
- Counter resets on any Epic or Legendary pull

**Reward types:** Traits (specific or random rarity), PAWS (fixed or range), Cubs, or external NFTs.

### Drops (`/drops`)

Limited-time events with exclusive crates and traits. Drops have lifecycle states: Draft, Scheduled, Live, Ended. Live drops show countdown timers and supply bars.

### Staking (`/staking`)

Earn PAWS (the platform's points currency) by staking Cubs. Earnings are based on:
- Base rate: 100 PAWS/day
- Rarity multiplier: Common (1x) to Legendary (3x)
- Trait bonuses: Some traits have flat PAWS boosts (baked into snapshots)
- 6-hour cooldown between claims

### Agents (`/agents`)

Deploy Cubs as autonomous agents that earn PAWS over time. Agents have levels, XP, specialties (Explorer, Guardian, Gatherer, Raider, Forager, Scout), and trait-based stat bonuses.

### Mint (`/mint`)

Three-phase minting:
1. GTD Spots (500) — Guaranteed whitelist holders
2. FCFS (1,500) — First come, first served
3. Public (8,000) — Open mint

Price: 0.05 ETH per Cub. Also includes a Bud Bear breeding card.

### Editor / Media Kit (`/editor`)

PFP and banner creation tool. Two modes:
- **PFP** (400x400) — Square profile picture
- **Banner** (1200x400) — Wide social banner

Features: NFT picker, overlay library, background presets, text tool, image uploader, layer controls (opacity, rotation, scale, position, blend mode), undo system.

### Token (`/token`)

Coming-soon page for the CUBS token. Will be used for minting, forging, trading, and governance.

### Achievements (`/achievements`)

Challenge system with point rewards: First Mint (100pts), Collector (250pts), Forger (500pts), Trader (200pts), Staker (300pts), Rare Finder (1000pts).

### Seasons (`/seasons`)

Seasonal events with progress tracking, countdown timers, and exclusive rewards.

### Admin Panel (`/admin`)

Platform management with tabs for: Drops, Crates, Traits, Economy settings, Analytics, Audit log.

---

## PAWS Economy

PAWS is the platform's internal points currency. It is **not** an ERC-20 token — it's a **ledger-based system** stored in PostgreSQL.

**How PAWS are earned:**
- Daily claims (50 PAWS)
- Staking rewards (rate x rarity multiplier)
- Crate drops
- Achievements
- Events and games
- Discord activity

**How PAWS are spent:**
- Buying crates
- Marketplace purchases
- Forging fees
- Trait burning fees

**Technical implementation:** No balance column exists. Balance is derived by summing all `PawsTransaction` records for a user. This ledger approach provides a complete audit trail and prevents balance manipulation. All PAWS operations use PostgreSQL advisory locks to prevent race conditions.

---

## Smart Contracts (Planned)

Smart contracts have **not yet been deployed**. The backend currently serves as the source of truth for all game logic. Four contracts are planned:

### 1. CUBS NFT Contract (ERC-721)

The core NFT contract for Cubs. Planned features:
- ERC-721 with metadata URI pointing to IPFS
- Breeding function: burn 2 Bud Bears to mint 1 Cub
- On-chain trait composition storage (or pointer to IPFS metadata)
- Version tracking for forge operations
- Royalty support (ERC-2981) at 5%

**Planned deployment:** Sepolia testnet first, then Ethereum mainnet.

### 2. CUBS Token Contract (ERC-20)

Potential on-chain version of PAWS. Would enable:
- Decentralized trading
- Governance voting
- Cross-platform interoperability
- Token burns as deflationary mechanism

**Note:** May remain off-chain as PAWS depending on regulatory considerations.

### 3. Staking Contract

On-chain staking for Cubs NFTs:
- Lock Cubs in contract to earn rewards
- Rarity-based multipliers enforced on-chain
- Claim function with cooldown
- Emergency unstake with penalty

### 4. Marketplace Contract

On-chain trading:
- Fixed-price listings
- Offer/bid system
- Platform fee (2.5%) and royalty (5%) enforcement
- Escrow for pending trades
- Multi-asset trades (Cubs + Traits)

### Bridge System (Future)

Cross-chain bridging planned for:
- Base
- Arbitrum
- Polygon
- Optimism

This would allow Cubs to move between EVM chains while maintaining trait data.

---

## Backend Architecture Deep Dive

### Authentication

Uses **SIWE (Sign-In With Ethereum)**:
1. Frontend requests a nonce from `/api/auth/nonce`
2. User signs the nonce with their wallet
3. Backend verifies signature via Viem and creates a session
4. 7-day session cookie stored

Also supports Discord bot authentication via service key headers.

### Transaction Intent System

Critical operations are protected by **idempotency tokens** to prevent double-processing:

| Intent Type | Operation |
|-------------|-----------|
| CRATE_OPEN | Opening a loot crate |
| CRATE_PURCHASE | Buying a crate |
| STAKING_CLAIM | Claiming staking rewards |
| MARKETPLACE_BUY | Purchasing a listing |
| FORGE_SAVE | Applying forge changes |

Each intent has a 5-minute lock window. If a duplicate request arrives within the window, it returns the existing result instead of re-processing.

### Job Queue System

Async work is handled by BullMQ (Redis-backed):

| Queue | Concurrency | Rate Limit | Purpose |
|-------|-------------|------------|---------|
| `cubs:render` | 2 workers | 5 per 10s | Image compositing and IPFS upload |
| `cubs:crate` | 5 workers | 20 per 10s | Reward distribution |

Both queues have exponential backoff retry and automatic cleanup.

### Render Pipeline

When a Cub is forged:
1. Backend validates trait ownership and compatibility
2. Traits are burned from inventory and equipped to Cub slots
3. A `CubVersion` snapshot is created
4. A render job is queued
5. The render worker composites layers using Sharp (in priority order)
6. The composed image is uploaded to IPFS via Pinata
7. ERC-721 metadata JSON is generated and uploaded
8. The Cub record is updated with new image and metadata URIs

### Rate Limiting

Redis-backed sliding window rate limits per operation:

| Operation | Limit | Window |
|-----------|-------|--------|
| Authentication | Configured per endpoint | 60 seconds |
| Crate opens | 10 | 60 seconds |
| Crate purchases | 5 | 60 seconds |
| Marketplace actions | Configured per endpoint | 60 seconds |
| Staking claims | Configured per endpoint | 60 seconds |

Rate limiting degrades gracefully — if Redis is unavailable, requests pass through.

### Database Schema

Key tables and their relationships:

```
users
  ├── cubs (ownership)
  │     ├── cub_equipped_traits (current composition)
  │     ├── cub_versions (immutable history)
  │     └── staking_positions (active stakes)
  ├── user_traits (trait inventory)
  ├── user_crates (crate inventory)
  ├── marketplace_listings (active sales)
  ├── marketplace_offers (active bids)
  ├── marketplace_trades (p2p swaps)
  ├── paws_transactions (complete ledger)
  └── user_badges (unlocked achievements)

trait_definitions (master trait data)
  ├── loot_table_entries (crate drop pools)
  └── crate_rewards (polymorphic rewards)

crate_definitions
  ├── crate_rewards
  └── crate_open_stats (pity tracking)

drops (limited-time events)
  ├── crate_definitions
  └── drop_traits

economy_config (singleton settings)
economy_stats_daily (aggregate analytics)
audit_log (admin action history)
transaction_intents (idempotency protection)
```

---

## Frontend Technical Details

### Design System

- **Colors:** OKLCH color space for perceptual uniformity
- **Primary:** Honey Gold (`oklch(0.82 0.17 80)`)
- **Accent:** Berry Pink (`oklch(0.7 0.2 350)`)
- **Typography:** Nunito (body), Lilita One (display/headings)
- **Theme:** Light/dark mode toggle with `next-themes`
- **Animations:** Framer Motion for page transitions, hover effects, and interactive elements
- **Cards:** Glass-morphism style with backdrop blur and subtle borders

### Custom Cursor

Bear paw cursor that replaces the native cursor site-wide:
- Default paw (idle)
- Pointer paw (hoverable elements)
- Works across all pages including wallet modals

### Floating Background

16 Cubs float across every page with:
- Framer Motion drift animations (continuous y/x oscillation)
- Zero-gravity physics: cursor proximity applies impulse force, Cubs spin and drift away, then slowly return to origin
- Direct DOM manipulation via refs + requestAnimationFrame (no React re-renders)

### Trait Registry

Hardcoded trait database derived from the original generation script's layer files. Each trait includes:
- Name (extracted from filename)
- Weight (rarity — lower = rarer)
- Category
- Image path (pointing to layer PNG files)

This registry powers the Forge's trait picker, rarity calculation, and leaderboard.

---

## Web3 Integration

### Current State

- **Wallet connection:** RainbowKit + wagmi (MetaMask, Rainbow, Coinbase, WalletConnect)
- **Chains:** Ethereum Mainnet and Sepolia testnet
- **RPC:** Alchemy
- **Auth:** SIWE signature verification

### Contract Addresses

Currently **placeholder (0x0)** — to be updated after deployment:

```
CUBS_NFT:         0x0000000000000000000000000000000000000000
CUBS_TOKEN:       0x0000000000000000000000000000000000000000
CUBS_STAKING:     0x0000000000000000000000000000000000000000
CUBS_MARKETPLACE: 0x0000000000000000000000000000000000000000
```

### Bud Bear Integration

Bud Bears is the parent NFT collection. Two Bud Bears are burned to breed one Cub. The Bud Bear contract address will be configured for the breeding function.

---

## Development & Deployment

### Local Development

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all services (Turbo)
```

Frontend runs on port 3000, backend on port 3001.

### Environment Variables

```
DATABASE_URL          # PostgreSQL connection string
SESSION_SECRET        # Session encryption key (min 16 chars)
FRONTEND_URL          # CORS origin
ALCHEMY_API_KEY       # Ethereum RPC
PINATA_API_KEY        # IPFS pinning
PINATA_SECRET_KEY     # IPFS pinning
ADMIN_WALLETS         # Comma-separated admin addresses
REDIS_URL             # Redis connection
BOT_SERVICE_KEY       # Discord bot auth
```

### Deployment

- Frontend: Vercel (static export)
- Backend: Any Node.js host with PostgreSQL and Redis access
- Assets: Layer PNGs served from `/public/assets/`

---

## Roadmap

1. **Phase 1** — Core platform (Home, Dashboard, Nav) ✅
2. **Phase 2** — Cub Forge and Trait System ✅
3. **Phase 3** — Crate System and Loot Engine ✅
4. **Phase 4** — Marketplace ✅
5. **Phase 5** — Dashboard and Cub Forge UI ✅
6. **Phase 6** — Drops, Admin Panel, Agents ✅
7. **Phase 7** — World Map Navigation ✅
8. **Phase 8** — Media Kit, Light/Dark Theme ✅
9. **Phase 9** — Smart Contract Development (upcoming)
10. **Phase 10** — Testnet Deployment and Testing
11. **Phase 11** — Mainnet Launch
12. **Phase 12** — Cross-Chain Bridge

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LayerPreview } from "@/components/forge/layer-preview";
import { TraitTabsPicker } from "@/components/forge/trait-tabs-picker";
import { CubSelector, type CubData } from "@/components/forge/cub-selector";
import { useForge, REGULAR_LAYER_ORDER, ONSIE_LAYER_ORDER } from "@/hooks/use-forge";
import { rarityTier } from "@/lib/rarity-engine";
import type { CubType } from "@/lib/trait-registry";
import { cn } from "@/lib/utils";
import { ArrowLeft, Flame, RotateCcw, Shuffle } from "lucide-react";

export default function ForgePage() {
  const {
    state,
    categories,
    attributes: _attributes,
    rarityPct,
    tier,
    delta,
    setTrait,
    removeTrait,
    resetToOriginal,
    randomize,
    setCubType,
    loadCub,
  } = useForge();

  const layerOrder = state.cubType === "onsie"
    ? (ONSIE_LAYER_ORDER as unknown as string[])
    : (REGULAR_LAYER_ORDER as unknown as string[]);

  const hasChanges = useMemo(
    () =>
      Object.keys(state.selections).some(
        (key) => state.selections[key] !== state.originalSelections[key],
      ),
    [state.selections, state.originalSelections],
  );

  const handleSelectCub = (cub: CubData) => {
    loadCub(cub.tokenId, cub.type as CubType, cub.attributes);
  };

  const handleDeselectCub = () => {
    loadCub(0, "regular", []);
  };

  const cubIsLoaded = state.loadedCubId !== null && state.loadedCubId !== 0;

  return (
    <div className="relative">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <AnimatePresence mode="wait">
          {!cubIsLoaded ? (
            /* ─── Step 1: Select a Cub ──────────────────────────── */
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-10">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Build your own
                </p>
                <h1 className="mt-3 font-display uppercase leading-[0.9] tracking-[-0.03em] text-[clamp(3rem,8vw,6rem)]">
                  <span className="block">Cub</span>
                  <span className="block text-primary">forge.</span>
                </h1>
                <p className="mt-4 max-w-xl text-muted-foreground">
                  Pick a cub from your wallet, mix and match traits, then
                  burn-and-forge a brand-new one-of-one NFT.
                </p>
              </div>
              <CubSelector
                selectedId={state.loadedCubId}
                onSelect={handleSelectCub}
              />
            </motion.div>
          ) : (
            /* ─── Step 2: Edit Traits (Duolingo-style layout) ──── */
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Back + title row */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={handleDeselectCub}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-xs font-bold uppercase tracking-widest transition hover:border-primary hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <p className="font-display text-xl uppercase tracking-tight">
                  Customise Cub <span className="text-primary">#{state.loadedCubId}</span>
                </p>
                {/* Cub type toggle (compact) */}
                <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
                  {(["regular", "onsie"] as CubType[]).map((type) => {
                    const isActive = state.cubType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setCubType(type)}
                        className={cn(
                          "rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest transition",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Two-column main */}
              <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                {/* ── Left: big preview canvas ────────────────── */}
                <div className="space-y-4">
                  <div className="rounded-3xl border border-border bg-card p-4 sm:p-6">
                    <LayerPreview
                      selections={state.selections}
                      cubType={state.cubType}
                      layerOrder={layerOrder}
                    />
                  </div>

                  {/* Active traits chip strip */}
                  <div className="rounded-3xl border border-border bg-card p-5">
                    <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                      Active traits
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {layerOrder.map((cat) => {
                        const trait = state.selections[cat] ?? "None";
                        if (trait === "None") return null;
                        const c = categories.find((c) => c.name === cat);
                        const t = c?.traits.find((t) => t.name === trait);
                        const pct = t && c ? (t.weight / c.totalWeight) * 100 : 100;
                        const r = rarityTier(100 - pct);
                        return (
                          <span
                            key={cat}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[11px]"
                          >
                            <span className="text-muted-foreground">{cat}</span>
                            <span className="font-medium">{trait.replace(/_/g, " ")}</span>
                            <span
                              className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                              style={{ color: r.color, background: `${r.color}22` }}
                            >
                              {pct.toFixed(1)}%
                            </span>
                          </span>
                        );
                      })}
                      {layerOrder.every((c) => !state.selections[c] || state.selections[c] === "None") && (
                        <span className="text-xs text-muted-foreground">No traits selected yet.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Right: tabbed picker + actions ─────────── */}
                <div className="space-y-4">
                  <TraitTabsPicker
                    categories={categories}
                    selections={state.selections}
                    cubType={state.cubType}
                    onSelectTrait={setTrait}
                    onRemoveTrait={removeTrait}
                  />

                  {/* Rarity bar + actions row */}
                  <div className="rounded-3xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Rarity score
                        </p>
                        <div className="mt-1 flex items-baseline gap-2">
                          <motion.span
                            key={rarityPct}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-display text-3xl"
                            style={{ color: tier.color }}
                          >
                            {rarityPct.toFixed(1)}
                          </motion.span>
                          <span className="text-xs text-muted-foreground">/ 100</span>
                          <span
                            className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: tier.color, background: `${tier.color}22` }}
                          >
                            {tier.label}
                          </span>
                        </div>
                      </div>
                      {delta.delta !== 0 && (
                        <span
                          className={cn(
                            "text-sm font-bold",
                            delta.delta > 0 ? "text-primary" : "text-destructive",
                          )}
                        >
                          {delta.delta > 0 ? "+" : ""}
                          {delta.delta.toFixed(1)}%
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: tier.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${rarityPct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      <button
                        onClick={randomize}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition hover:border-primary hover:text-primary"
                      >
                        <Shuffle className="h-3.5 w-3.5" />
                        Randomise
                      </button>
                      <button
                        onClick={resetToOriginal}
                        disabled={!hasChanges}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* DONE / Forge CTA */}
                  <button
                    disabled={!hasChanges}
                    className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 font-display text-xl uppercase tracking-tight text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                  >
                    <Flame className="h-5 w-5" />
                    Burn &amp; Forge
                  </button>
                  <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
                    Burns the current cub. Mints a fresh one with these traits.
                  </p>

                  <div className="rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                    Tip: pick the rarest trait in each slot to push your
                    rarity score above 90 and unlock a Legendary tier.{" "}
                    <Link href="/roadmap" className="text-primary hover:underline">
                      Read the rules
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

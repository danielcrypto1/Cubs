"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { FloatingBackground } from "@/components/shared/floating-background";
import { LayerPreview } from "@/components/forge/layer-preview";
import { TraitPicker } from "@/components/forge/trait-picker";
import { RarityDisplay } from "@/components/forge/rarity-display";
import { RarityLeaderboard } from "@/components/forge/rarity-leaderboard";
import { ForgeActions } from "@/components/forge/forge-actions";
import { CubSelector, type CubData } from "@/components/forge/cub-selector";
import { useForge, REGULAR_LAYER_ORDER, ONSIE_LAYER_ORDER } from "@/hooks/use-forge";
import { rarityTier } from "@/lib/rarity-engine";
import type { CubType } from "@/lib/trait-registry";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgePage() {
  const {
    state,
    categories,
    attributes,
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

  const hasChanges = useMemo(() => {
    return Object.keys(state.selections).some(
      (key) => state.selections[key] !== state.originalSelections[key],
    );
  }, [state.selections, state.originalSelections]);

  const breakdown = useMemo(() => {
    return layerOrder.map((category) => {
      const trait = state.selections[category] ?? "None";
      const cat = categories.find((c) => c.name === category);
      const traitObj = cat?.traits.find((t) => t.name === trait);
      const pct = traitObj && cat ? (traitObj.weight / cat.totalWeight) * 100 : 100;
      return {
        category,
        trait,
        percentage: Math.round(pct * 100) / 100,
        tierLabel: trait === "None" ? "Empty" : rarityTier(100 - pct).label,
      };
    });
  }, [state.selections, categories, layerOrder]);

  const handleSelectCub = (cub: CubData) => {
    loadCub(cub.tokenId, cub.type as CubType, cub.attributes);
  };

  const handleDeselectCub = () => {
    loadCub(0, "regular", []);
    // Reset to default state with no cub loaded
  };

  const cubIsLoaded = state.loadedCubId !== null && state.loadedCubId !== 0;

  return (
    <div className="relative min-h-screen">
      <FloatingBackground count={8} />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <PageHeader
          title="Cub Forge"
          description="Select a Cub from your wallet, customize its traits, then burn & forge a new NFT."
        />

        <AnimatePresence mode="wait">
          {!cubIsLoaded ? (
            /* ── Step 1: Select a Cub ──────────────────────── */
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CubSelector
                selectedId={state.loadedCubId}
                onSelect={handleSelectCub}
              />
            </motion.div>
          ) : (
            /* ── Step 2: Edit Traits ──────────────────────── */
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Back button */}
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 gap-2"
                onClick={handleDeselectCub}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Cub Selection
              </Button>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Left: Layer Preview */}
                <div className="lg:col-span-4">
                  <div className="sticky top-24 space-y-4">
                    <LayerPreview
                      selections={state.selections}
                      cubType={state.cubType}
                      layerOrder={layerOrder}
                    />

                    {/* Trait summary */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <h3 className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <span>Active Traits</span>
                        <span className="normal-case tracking-normal text-foreground">
                          Cub #{state.loadedCubId}
                        </span>
                      </h3>
                      <div className="space-y-1.5">
                        {breakdown
                          .filter((b) => b.trait !== "None")
                          .map((b) => {
                            const t = rarityTier(100 - b.percentage);
                            return (
                              <div
                                key={b.category}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="text-muted-foreground">
                                  {b.category}
                                </span>
                                <span className="flex items-center gap-2">
                                  <span className="text-foreground">
                                    {b.trait.replace(/_/g, " ")}
                                  </span>
                                  <span
                                    className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                                    style={{
                                      color: t.color,
                                      backgroundColor: `${t.color}20`,
                                    }}
                                  >
                                    {b.percentage.toFixed(1)}%
                                  </span>
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center: Trait Picker */}
                <div className="lg:col-span-4">
                  {/* Cub Type Toggle */}
                  <div className="mb-4">
                    <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
                      {(["regular", "onsie"] as CubType[]).map((type) => {
                        const isActive = state.cubType === type;
                        const label = type === "regular" ? "Regular" : "Onsie";
                        return (
                          <button
                            key={type}
                            onClick={() => setCubType(type)}
                            className={cn(
                              "relative rounded-md px-4 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground/80",
                            )}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="forge-type-toggle"
                                className="absolute inset-0 rounded-md bg-white/10"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                            <span className="relative z-10">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {state.cubType === "onsie"
                        ? "Onsie mode: 5 categories — Outfit, Hat, Accessories & Shoes are replaced by the Onsie layer."
                        : "Regular mode: 8 trait categories available."}
                    </p>
                  </div>

                  <h2 className="mb-4 text-lg font-semibold">Select Traits</h2>
                  <TraitPicker
                    categories={categories}
                    selections={state.selections}
                    onSelectTrait={setTrait}
                    onRemoveTrait={removeTrait}
                  />
                </div>

                {/* Right: Rarity + Actions */}
                <div className="space-y-6 lg:col-span-4">
                  <div className="sticky top-24 space-y-6">
                    <RarityDisplay
                      percentage={rarityPct}
                      tier={tier}
                      delta={delta}
                      breakdown={breakdown}
                    />

                    <ForgeActions
                      onRandomize={randomize}
                      onReset={resetToOriginal}
                      hasChanges={hasChanges}
                      rarityScore={rarityPct}
                    />

                    <RarityLeaderboard currentScore={rarityPct} />
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

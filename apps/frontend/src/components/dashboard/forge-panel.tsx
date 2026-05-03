"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { popIn } from "@/lib/animations";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Flame,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getTraitCategories,
  getTraitByName,
  type CubType,
  type TraitCategory,
  type Trait,
} from "@/lib/trait-registry";
import {
  cubRarityPercentage,
  rarityTier,
  rarityDelta,
  traitRarityScore,
} from "@/lib/rarity-engine";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ForgeCub {
  id: number;
  name: string;
  type: CubType;
  imagePath: string;
  attributes: { trait_type: string; value: string }[];
}

// ─── Sample cubs from real collection data ──────────────────────────────────

const SAMPLE_CUBS: ForgeCub[] = [
  {
    id: 1,
    name: "Cubs NFT #1",
    type: "regular",
    imagePath: "/assets/collection/images/1.png",
    attributes: [
      { trait_type: "Background", value: "Granite" },
      { trait_type: "Body", value: "Ghost" },
      { trait_type: "Outfit", value: "None" },
      { trait_type: "Hat", value: "Black_Beanie" },
      { trait_type: "Eyes", value: "Angry" },
      { trait_type: "Accessories", value: "None" },
      { trait_type: "Mouth", value: "Cub" },
      { trait_type: "Shoes", value: "None" },
    ],
  },
  {
    id: 100,
    name: "Cubs NFT #100",
    type: "regular",
    imagePath: "/assets/collection/images/100.png",
    attributes: [
      { trait_type: "Background", value: "New Punk Blue" },
      { trait_type: "Body", value: "Panda_Bear" },
      { trait_type: "Outfit", value: "None" },
      { trait_type: "Hat", value: "Intuition_Cap" },
      { trait_type: "Eyes", value: "Cubs" },
      { trait_type: "Accessories", value: "Nose_Ring" },
      { trait_type: "Mouth", value: "Cub" },
      { trait_type: "Shoes", value: "None" },
    ],
  },
  {
    id: 129,
    name: "Cubs NFT #129",
    type: "onsie",
    imagePath: "/assets/collection/images/129.png",
    attributes: [
      { trait_type: "Background", value: "Baby Blue" },
      { trait_type: "Body", value: "Brown_Bear" },
      { trait_type: "Mouth", value: "Growl_Gold" },
      { trait_type: "Onsie", value: "Ninja" },
      { trait_type: "Eyes", value: "Anime" },
    ],
  },
  {
    id: 500,
    name: "Cubs NFT #500",
    type: "regular",
    imagePath: "/assets/collection/images/500.png",
    attributes: [
      { trait_type: "Background", value: "Baby Blue" },
      { trait_type: "Body", value: "Orange_Gummy" },
      { trait_type: "Outfit", value: "None" },
      { trait_type: "Hat", value: "Black_Bucket" },
      { trait_type: "Eyes", value: "Cubs" },
      { trait_type: "Accessories", value: "None" },
      { trait_type: "Mouth", value: "Grin" },
      { trait_type: "Shoes", value: "None" },
    ],
  },
  {
    id: 15,
    name: "Cubs NFT #15",
    type: "oneofone",
    imagePath: "/assets/collection/images/15.png",
    attributes: [{ trait_type: "Rarity", value: "1 of 1" }],
  },
];

// ─── Layer Compositor ───────────────────────────────────────────────────────

function LayerCompositor({
  attributes,
  cubType,
  size = 500,
}: {
  attributes: { trait_type: string; value: string }[];
  cubType: CubType;
  size?: number;
}) {
  const categories = getTraitCategories(cubType);
  const isOnsie = cubType === "onsie";

  // Build layers in render order
  const layers = categories
    .map((cat) => {
      const attr = attributes.find((a) => a.trait_type === cat.name);
      if (!attr || attr.value === "None") return null;
      const trait = getTraitByName(cat.name, attr.value, isOnsie);
      if (!trait) return null;
      return { category: cat.name, trait, path: trait.imagePath };
    })
    .filter(Boolean) as { category: string; trait: Trait; path: string }[];

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/30" style={{ maxWidth: size }}>
      {layers.map((layer, i) => (
        <img
          key={`${layer.category}-${layer.trait.name}`}
          src={layer.path}
          alt={`${layer.category}: ${layer.trait.displayName}`}
          className="absolute inset-0 h-full w-full object-contain"
          style={{ zIndex: i + 1 }}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
      {layers.length === 0 && (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No layers selected
        </div>
      )}
    </div>
  );
}

// ─── Rarity Gauge ───────────────────────────────────────────────────────────

function RarityGauge({
  percentage,
  delta,
  label,
}: {
  percentage: number;
  delta?: number;
  label?: string;
}) {
  const tier = rarityTier(percentage);
  return (
    <div className="space-y-2">
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-3 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: tier.color }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
        <span className="text-sm font-bold tabular-nums" style={{ color: tier.color }}>
          {percentage.toFixed(1)}%
        </span>
        {delta !== undefined && delta !== 0 && (
          <span
            className="flex items-center gap-0.5 text-xs font-semibold"
            style={{ color: delta > 0 ? "#22c55e" : "#ef4444" }}
          >
            {delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge
          className="text-[10px] font-bold"
          style={{ backgroundColor: tier.color + "20", color: tier.color, borderColor: tier.color + "40" }}
        >
          {tier.label}
        </Badge>
      </div>
    </div>
  );
}

// ─── Trait Selector Row ─────────────────────────────────────────────────────

function TraitSelector({
  category,
  currentValue,
  originalValue,
  isOnsie,
  onSelect,
}: {
  category: TraitCategory;
  currentValue: string;
  originalValue: string;
  isOnsie: boolean;
  onSelect: (traitName: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isChanged = currentValue !== originalValue;

  const currentTrait = category.traits.find((t) => t.name === currentValue);
  const currentScore = currentTrait
    ? (category.totalWeight / currentTrait.weight)
    : 0;
  const currentPct = currentTrait
    ? ((currentTrait.weight / category.totalWeight) * 100)
    : 0;

  // Sort traits by weight ascending (rarest first)
  const sortedTraits = useMemo(
    () => [...category.traits].sort((a, b) => a.weight - b.weight),
    [category.traits],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/50">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{category.name}</p>
            <p className="text-sm font-medium">
              {currentTrait?.displayName ?? "None"}
              {isChanged && (
                <span className="ml-2 text-[10px] text-amber-400">(modified)</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentTrait && (
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {currentPct.toFixed(1)}% chance
            </span>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded trait list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="max-h-[240px] overflow-y-auto border-t border-border p-2">
              {sortedTraits.map((trait) => {
                const isActive = trait.name === currentValue;
                const pct = (trait.weight / category.totalWeight) * 100;
                const tier = rarityTier(
                  100 - pct * (100 / Math.max(...category.traits.map((t) => (t.weight / category.totalWeight) * 100))),
                );

                return (
                  <button
                    key={trait.name}
                    onClick={() => {
                      onSelect(trait.name);
                      setExpanded(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      <span className={isActive ? "font-medium" : ""}>{trait.displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] tabular-nums">{pct.toFixed(1)}%</span>
                      <div
                        className="h-1.5 w-8 overflow-hidden rounded-full bg-secondary"
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(5, 100 - pct)}%`,
                            backgroundColor: tier.color,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Forge Panel ───────────────────────────────────────────────────────

export function ForgePanel() {
  const [selectedCub, setSelectedCub] = useState<ForgeCub | null>(null);
  const [proposedAttributes, setProposedAttributes] = useState<
    { trait_type: string; value: string }[]
  >([]);
  const [showOriginal, setShowOriginal] = useState(false);

  const handleSelectCub = useCallback((cub: ForgeCub) => {
    setSelectedCub(cub);
    setProposedAttributes([...cub.attributes]);
    setShowOriginal(false);
  }, []);

  const handleTraitChange = useCallback(
    (category: string, traitName: string) => {
      setProposedAttributes((prev) =>
        prev.map((attr) =>
          attr.trait_type === category ? { ...attr, value: traitName } : attr,
        ),
      );
    },
    [],
  );

  const handleReset = useCallback(() => {
    if (selectedCub) {
      setProposedAttributes([...selectedCub.attributes]);
    }
  }, [selectedCub]);

  const hasChanges = useMemo(() => {
    if (!selectedCub) return false;
    return selectedCub.attributes.some((attr, i) => attr.value !== proposedAttributes[i]?.value);
  }, [selectedCub, proposedAttributes]);

  const delta = useMemo(() => {
    if (!selectedCub || selectedCub.type === "oneofone") return null;
    return rarityDelta(selectedCub.attributes, proposedAttributes, selectedCub.type);
  }, [selectedCub, proposedAttributes]);

  const proposedPercentage = useMemo(() => {
    if (!selectedCub || selectedCub.type === "oneofone") return 0;
    return cubRarityPercentage(proposedAttributes, selectedCub.type);
  }, [selectedCub, proposedAttributes]);

  const originalPercentage = useMemo(() => {
    if (!selectedCub || selectedCub.type === "oneofone") return 0;
    return cubRarityPercentage(selectedCub.attributes, selectedCub.type);
  }, [selectedCub]);

  // ─── Cub selection grid ─────────────────────────────────────────────────

  if (!selectedCub) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Cub Forge</h3>
            <p className="text-sm text-muted-foreground">
              Select a Cub to customize its traits, then burn & re-mint with your changes.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SAMPLE_CUBS.map((cub) => {
            const pct =
              cub.type === "oneofone"
                ? 100
                : cubRarityPercentage(cub.attributes, cub.type);
            const tier = rarityTier(pct);

            return (
              <motion.div key={cub.id} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <Card
                  className={`cursor-pointer overflow-hidden border transition-colors hover:border-primary/50 ${
                    cub.type === "oneofone" ? "opacity-60" : ""
                  }`}
                  onClick={() => cub.type !== "oneofone" && handleSelectCub(cub)}
                >
                  <div className="relative aspect-square bg-muted">
                    <img
                      src={cub.imagePath}
                      alt={cub.name}
                      className="h-full w-full object-cover"
                    />
                    {cub.type === "oneofone" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40">
                          1/1 — Not Editable
                        </Badge>
                      </div>
                    )}
                    {cub.type === "onsie" && (
                      <Badge className="absolute top-2 right-2 bg-purple-500/20 text-purple-400 border-purple-500/40 text-[10px]">
                        Onsie
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{cub.name}</p>
                      <Badge
                        className="text-[10px]"
                        style={{
                          backgroundColor: tier.color + "20",
                          color: tier.color,
                          borderColor: tier.color + "40",
                        }}
                      >
                        {pct.toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {cub.attributes.length} traits · {tier.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Forge editor ───────────────────────────────────────────────────────

  const categories = getTraitCategories(selectedCub.type);
  const isOnsie = selectedCub.type === "onsie";

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setSelectedCub(null)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOriginal(!showOriginal)}
          >
            {showOriginal ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showOriginal ? "Show Modified" : "Show Original"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: Preview + Rarity */}
        <div className="space-y-4">
          {/* Layer compositor */}
          <Card className="overflow-hidden">
            <div className="relative">
              <LayerCompositor
                attributes={showOriginal ? selectedCub.attributes : proposedAttributes}
                cubType={selectedCub.type}
              />
              {showOriginal && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-background/80 text-foreground backdrop-blur-sm">
                    Original
                  </Badge>
                </div>
              )}
              {!showOriginal && hasChanges && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-amber-500/20 text-amber-400 backdrop-blur-sm border-amber-500/40">
                    Modified
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Rarity comparison */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-bold">Rarity Score</h4>
              </div>
              <RarityGauge
                percentage={proposedPercentage}
                delta={delta?.delta}
                label="Current Build"
              />
              {hasChanges && (
                <div className="border-t border-border pt-3">
                  <RarityGauge
                    percentage={originalPercentage}
                    label="Original"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Burn & Forge button */}
          <Button
            className="w-full h-12 text-base font-bold"
            disabled={!hasChanges}
            onClick={() => {
              // TODO: Connect to smart contract
              alert("Burn & Forge flow will connect to smart contract. This would burn the original NFT and mint a new one with the modified traits.");
            }}
          >
            <Flame className="mr-2 h-5 w-5" />
            {hasChanges ? "Burn & Forge New Cub" : "Make changes to forge"}
          </Button>
        </div>

        {/* Right: Trait selectors */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Trait Layers
          </h3>
          {categories.map((cat) => {
            const currentAttr = proposedAttributes.find(
              (a) => a.trait_type === cat.name,
            );
            const originalAttr = selectedCub.attributes.find(
              (a) => a.trait_type === cat.name,
            );

            return (
              <TraitSelector
                key={cat.name}
                category={cat}
                currentValue={currentAttr?.value ?? "None"}
                originalValue={originalAttr?.value ?? "None"}
                isOnsie={isOnsie}
                onSelect={(name) => handleTraitChange(cat.name, name)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useMemo } from "react";
import {
  type CubType,
  type TraitCategory,
  getTraitCategories,
  getTraitByName,
} from "@/lib/trait-registry";
import {
  cubRarityPercentage,
  rarityTier,
  rarityDelta,
  traitRarityScore,
} from "@/lib/rarity-engine";

export interface ForgeState {
  cubType: CubType;
  /** Token ID of loaded cub (null = no cub selected) */
  loadedCubId: number | null;
  /** Current trait selections keyed by category name */
  selections: Record<string, string>;
  /** Original selections (before editing) for delta comparison */
  originalSelections: Record<string, string>;
}

export const REGULAR_LAYER_ORDER = [
  "Background", "Body", "Outfit", "Hat", "Eyes", "Accessories", "Mouth", "Shoes",
] as const;

export const ONSIE_LAYER_ORDER = [
  "Background", "Body", "Mouth", "Onsie", "Eyes",
] as const;

/** Categories shared between regular and onsie modes */
const SHARED_CATEGORIES = ["Background", "Body", "Eyes", "Mouth"];

const DEFAULT_REGULAR_SELECTIONS: Record<string, string> = {
  Background: "Baby Blue",
  Body: "Brown_Bear",
  Outfit: "None",
  Hat: "None",
  Eyes: "Cubs",
  Accessories: "None",
  Mouth: "Cub",
  Shoes: "None",
};

const DEFAULT_ONSIE_SELECTIONS: Record<string, string> = {
  Background: "Baby Blue",
  Body: "Brown_Bear",
  Mouth: "Cub",
  Onsie: "Space_Cub",
  Eyes: "Cubs",
};

export function useForge() {
  const [state, setState] = useState<ForgeState>({
    cubType: "regular",
    loadedCubId: null,
    selections: { ...DEFAULT_REGULAR_SELECTIONS },
    originalSelections: { ...DEFAULT_REGULAR_SELECTIONS },
  });

  const categories = useMemo(
    () => getTraitCategories(state.cubType),
    [state.cubType],
  );

  const layerOrder = useMemo(
    () => (state.cubType === "onsie" ? ONSIE_LAYER_ORDER : REGULAR_LAYER_ORDER) as readonly string[],
    [state.cubType],
  );

  const attributes = useMemo(
    () =>
      layerOrder.map((cat) => ({
        trait_type: cat,
        value: state.selections[cat] ?? "None",
      })),
    [state.selections, layerOrder],
  );

  const originalAttributes = useMemo(
    () =>
      layerOrder.map((cat) => ({
        trait_type: cat,
        value: state.originalSelections[cat] ?? "None",
      })),
    [state.originalSelections, layerOrder],
  );

  const rarityPct = useMemo(
    () => cubRarityPercentage(attributes, state.cubType),
    [attributes, state.cubType],
  );

  const tier = useMemo(() => rarityTier(rarityPct), [rarityPct]);

  const delta = useMemo(
    () => rarityDelta(originalAttributes, attributes, state.cubType),
    [originalAttributes, attributes, state.cubType],
  );

  const setTrait = useCallback((category: string, traitName: string) => {
    setState((prev) => ({
      ...prev,
      selections: { ...prev.selections, [category]: traitName },
    }));
  }, []);

  const removeTrait = useCallback((category: string) => {
    setState((prev) => ({
      ...prev,
      selections: { ...prev.selections, [category]: "None" },
    }));
  }, []);

  const resetToOriginal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selections: { ...prev.originalSelections },
    }));
  }, []);

  const randomize = useCallback(() => {
    setState((prev) => {
      const cats = getTraitCategories(prev.cubType);
      const newSelections: Record<string, string> = {};
      for (const cat of cats) {
        // Weighted random selection
        const totalWeight = cat.totalWeight;
        let roll = Math.random() * totalWeight;
        let chosen = cat.traits[0]?.name ?? "None";
        for (const trait of cat.traits) {
          roll -= trait.weight;
          if (roll <= 0) {
            chosen = trait.name;
            break;
          }
        }
        newSelections[cat.name] = chosen;
      }
      return { ...prev, selections: newSelections };
    });
  }, []);

  const setCubType = useCallback((newType: CubType) => {
    setState((prev) => {
      if (prev.cubType === newType) return prev;

      const defaults =
        newType === "onsie" ? DEFAULT_ONSIE_SELECTIONS : DEFAULT_REGULAR_SELECTIONS;
      const validKeys = newType === "onsie"
        ? ONSIE_LAYER_ORDER as readonly string[]
        : REGULAR_LAYER_ORDER as readonly string[];

      // Start from defaults, carry over shared traits that exist in the new mode
      const newSelections: Record<string, string> = { ...defaults };
      for (const cat of SHARED_CATEGORIES) {
        if (validKeys.includes(cat) && prev.selections[cat]) {
          newSelections[cat] = prev.selections[cat];
        }
      }

      return {
        cubType: newType,
        selections: newSelections,
        originalSelections: newSelections,
      };
    });
  }, []);

  /** Load a real cub's traits from metadata */
  const loadCub = useCallback(
    (cubId: number, cubType: CubType, attributes: { trait_type: string; value: string }[]) => {
      const layerKeys = cubType === "onsie"
        ? ONSIE_LAYER_ORDER as readonly string[]
        : REGULAR_LAYER_ORDER as readonly string[];

      const selections: Record<string, string> = {};
      for (const key of layerKeys) {
        const attr = attributes.find((a) => a.trait_type === key);
        selections[key] = attr?.value ?? "None";
      }

      setState({
        cubType,
        loadedCubId: cubId,
        selections,
        originalSelections: { ...selections },
      });
    },
    [],
  );

  /** Get rarity info for a single trait in context */
  const getTraitRarity = useCallback(
    (category: string, traitName: string) => {
      const score = traitRarityScore(
        category,
        traitName,
        state.cubType === "onsie",
      );
      const cat = categories.find((c) => c.name === category);
      if (!cat) return { score: 0, percentage: 0, tier: rarityTier(0) };
      const trait = cat.traits.find((t) => t.name === traitName);
      const pct = trait ? (trait.weight / cat.totalWeight) * 100 : 0;
      return {
        score,
        percentage: Math.round(pct * 100) / 100,
        tier: rarityTier(100 - pct), // invert: lower % = rarer = higher tier
      };
    },
    [state.cubType, categories],
  );

  return {
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
    getTraitRarity,
  };
}

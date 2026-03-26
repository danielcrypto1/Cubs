"use client";

import { useState, useCallback } from "react";
import { TRAIT_LAYER_ORDER } from "@/lib/constants";
import {
  MOCK_EDITOR_CUB_STATES,
  MOCK_TRAIT_DEFINITIONS,
} from "@/lib/mock-data";
import type {
  EditorCubState,
  EditorLayerConfig,
  EditorSaveResult,
  TraitCategory,
} from "@/types";

interface EditorHistory {
  past: EditorLayerConfig[][];
  current: EditorLayerConfig[];
}

export function useEditor() {
  const [cubState, setCubState] = useState<EditorCubState | null>(null);
  const [history, setHistory] = useState<EditorHistory | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scene, setSceneState] = useState<string | null>(null);

  const loadCub = useCallback((cubId: string) => {
    setError(null);
    const state = MOCK_EDITOR_CUB_STATES[cubId];
    if (!state) {
      setError("Cub not found");
      return;
    }
    setCubState(state);
    setHistory({ past: [], current: state.layers });
  }, []);

  const applyTrait = useCallback(
    (traitDefinitionId: string) => {
      if (!cubState || !history) return;
      setError(null);

      const def = MOCK_TRAIT_DEFINITIONS.find((t) => t.id === traitDefinitionId);
      if (!def) {
        setError("Trait not found");
        return;
      }

      const newLayer: EditorLayerConfig = {
        category: def.category,
        traitDefinitionId: def.id,
        imageUrl: def.imageUrl,
        name: def.name,
      };

      const newLayers = history.current.map((l) =>
        l.category === newLayer.category ? newLayer : l,
      );

      setHistory({
        past: [...history.past, history.current],
        current: newLayers,
      });
    },
    [cubState, history],
  );

  const removeTrait = useCallback(
    (category: TraitCategory) => {
      if (!history) return;

      const newLayers = history.current.map((l) =>
        l.category === category
          ? { category, traitDefinitionId: null, imageUrl: null, name: null }
          : l,
      );

      setHistory({
        past: [...history.past, history.current],
        current: newLayers,
      });
    },
    [history],
  );

  const undo = useCallback(() => {
    if (!history || history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    setHistory({
      past: history.past.slice(0, -1),
      current: previous,
    });
  }, [history]);

  const reset = useCallback(() => {
    if (!cubState) return;
    setHistory({ past: [], current: cubState.layers });
  }, [cubState]);

  const save = useCallback(async (): Promise<EditorSaveResult | null> => {
    if (!cubState || !history) return null;
    setSaving(true);
    setError(null);

    // Simulate save delay
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);

    return {
      cubId: cubState.cubId,
      imageUrl: "https://placehold.co/1024x1024/1a1a2e/f59e0b?text=Saved",
      metadataUri: "ipfs://mock-metadata-uri",
    };
  }, [cubState, history]);

  const setScene = useCallback((sceneId: string | null) => {
    setSceneState(sceneId);
  }, []);

  const hasChanges = history !== null && history.past.length > 0;
  const canUndo = history !== null && history.past.length > 0;

  return {
    cubState,
    layers: history?.current ?? [],
    loadCub,
    applyTrait,
    removeTrait,
    undo,
    reset,
    save,
    saving,
    error,
    hasChanges,
    canUndo,
    scene,
    setScene,
  };
}

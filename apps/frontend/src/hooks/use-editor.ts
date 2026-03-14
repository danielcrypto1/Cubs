"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api-client";
import { TRAIT_LAYER_ORDER } from "@/lib/constants";
import type { EditorCubState, EditorLayerConfig, EditorSaveResult, TraitCategory } from "@/types";

interface EditorHistory {
  past: EditorLayerConfig[][];
  current: EditorLayerConfig[];
}

export function useEditor() {
  const [cubState, setCubState] = useState<EditorCubState | null>(null);
  const [history, setHistory] = useState<EditorHistory | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCub = useCallback(async (cubId: string) => {
    setError(null);
    try {
      const res = await api.get<{ data: EditorCubState }>(`/api/editor/cub/${cubId}`);
      setCubState(res.data);
      setHistory({ past: [], current: res.data.layers });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cub");
    }
  }, []);

  const applyTrait = useCallback(
    async (traitDefinitionId: string) => {
      if (!cubState || !history) return;
      setError(null);

      try {
        const res = await api.post<{ data: EditorLayerConfig }>("/api/editor/apply-trait", {
          cubId: cubState.cubId,
          traitDefinitionId,
        });

        const newLayer = res.data;
        const newLayers = history.current.map((l) =>
          l.category === newLayer.category ? newLayer : l,
        );

        setHistory({
          past: [...history.past, history.current],
          current: newLayers,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to apply trait");
      }
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

    try {
      const layers = TRAIT_LAYER_ORDER.map((category) => {
        const layer = history.current.find((l) => l.category === category);
        return {
          category,
          traitDefinitionId: layer?.traitDefinitionId ?? null,
        };
      });

      const res = await api.post<{ data: EditorSaveResult }>("/api/editor/save", {
        cubId: cubState.cubId,
        layers,
      });

      return res.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      return null;
    } finally {
      setSaving(false);
    }
  }, [cubState, history]);

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
  };
}

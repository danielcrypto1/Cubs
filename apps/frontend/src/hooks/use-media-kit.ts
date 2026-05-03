"use client";

import { useState, useCallback, useMemo } from "react";
import { MOCK_CUBS } from "@/lib/mock-data";
import { MOCK_OVERLAYS, MOCK_BACKGROUNDS, CANVAS_DIMENSIONS } from "@/lib/media-kit-data";
import type { EditorMode, MediaKitLayer, GradientConfig } from "@/types";

let nextLayerId = 1;
function genId() {
  return `layer-${nextLayerId++}`;
}

function createDefaultBackground(): MediaKitLayer {
  return {
    id: genId(),
    type: "background",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    backgroundColor: "#0f172a",
    zIndex: 0,
    visible: true,
  };
}

interface History {
  past: MediaKitLayer[][];
  current: MediaKitLayer[];
}

export function useMediaKit() {
  const [mode, setModeState] = useState<EditorMode>("pfp");
  const [selectedCubId, setSelectedCubId] = useState<string | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [history, setHistory] = useState<History>({
    past: [],
    current: [createDefaultBackground()],
  });

  const dims = CANVAS_DIMENSIONS[mode];
  const layers = history.current;

  const selectedLayer = useMemo(
    () => (selectedLayerId ? layers.find((l) => l.id === selectedLayerId) ?? null : null),
    [selectedLayerId, layers],
  );

  // ── History helpers ──────────────────────────────────────────────────

  const pushHistory = useCallback(
    (newLayers: MediaKitLayer[]) => {
      setHistory((prev) => ({
        past: [...prev.past, prev.current],
        current: newLayers,
      }));
    },
    [],
  );

  // ── Mode ─────────────────────────────────────────────────────────────

  const setMode = useCallback(
    (newMode: EditorMode) => {
      if (newMode === mode) return;
      const oldDims = CANVAS_DIMENSIONS[mode];
      const newDims = CANVAS_DIMENSIONS[newMode];
      const scaleX = newDims.width / oldDims.width;
      const scaleY = newDims.height / oldDims.height;

      const scaled = layers.map((l) =>
        l.type === "background"
          ? l
          : {
              ...l,
              x: Math.round(l.x * scaleX),
              y: Math.round(l.y * scaleY),
              width: Math.round(l.width * scaleX),
              height: Math.round(l.height * scaleY),
            },
      );

      setModeState(newMode);
      pushHistory(scaled);
    },
    [mode, layers, pushHistory],
  );

  // ── Select Cub ───────────────────────────────────────────────────────

  const selectCub = useCallback(
    (cubId: string) => {
      const cub = MOCK_CUBS.find((c) => c.id === cubId);
      if (!cub) return;

      setSelectedCubId(cubId);

      // Remove any existing NFT layer, add new one
      const withoutNft = layers.filter((l) => l.type !== "nft");
      const size = Math.min(dims.width, dims.height) * 0.8;
      const nftLayer: MediaKitLayer = {
        id: genId(),
        type: "nft",
        x: Math.round((dims.width - size) / 2),
        y: Math.round((dims.height - size) / 2),
        width: Math.round(size),
        height: Math.round(size),
        rotation: 0,
        imageUrl: cub.imageUrl,
        zIndex: 10,
        visible: true,
      };

      pushHistory([...withoutNft, nftLayer]);
      setSelectedLayerId(nftLayer.id);
    },
    [layers, dims, pushHistory],
  );

  // ── Background ───────────────────────────────────────────────────────

  const setBackground = useCallback(
    (presetId: string) => {
      const preset = MOCK_BACKGROUNDS.find((b) => b.id === presetId);
      if (!preset) return;

      const updated = layers.map((l) => {
        if (l.type !== "background") return l;
        const base: MediaKitLayer = {
          ...l,
          backgroundColor: undefined,
          gradient: undefined,
          pattern: undefined,
        };
        if (preset.type === "solid") {
          return { ...base, backgroundColor: preset.value };
        }
        if (preset.type === "gradient" && preset.gradient) {
          return { ...base, gradient: preset.gradient };
        }
        if (preset.type === "pattern") {
          return { ...base, pattern: preset.value };
        }
        return l;
      });

      pushHistory(updated);
    },
    [layers, pushHistory],
  );

  // ── Add Overlay ──────────────────────────────────────────────────────

  const addOverlay = useCallback(
    (overlayId: string) => {
      const asset = MOCK_OVERLAYS.find((o) => o.id === overlayId);
      if (!asset) return;

      const maxZ = Math.max(...layers.map((l) => l.zIndex), 0);
      const overlay: MediaKitLayer = {
        id: genId(),
        type: "overlay",
        x: Math.round((dims.width - asset.defaultWidth) / 2),
        y: Math.round((dims.height - asset.defaultHeight) / 2),
        width: asset.defaultWidth,
        height: asset.defaultHeight,
        rotation: 0,
        imageUrl: asset.imageUrl,
        zIndex: maxZ + 1,
        visible: true,
      };

      pushHistory([...layers, overlay]);
      setSelectedLayerId(overlay.id);
    },
    [layers, dims, pushHistory],
  );

  // ── Add Text ─────────────────────────────────────────────────────────

  const addText = useCallback(
    (opts: { text: string; fontFamily: string; fontSize: number; fontColor: string }) => {
      const maxZ = Math.max(...layers.map((l) => l.zIndex), 0);
      const textLayer: MediaKitLayer = {
        id: genId(),
        type: "text",
        x: Math.round(dims.width * 0.1),
        y: Math.round(dims.height * 0.4),
        width: Math.round(dims.width * 0.8),
        height: opts.fontSize * 1.5,
        rotation: 0,
        text: opts.text,
        fontFamily: opts.fontFamily,
        fontSize: opts.fontSize,
        fontColor: opts.fontColor,
        zIndex: maxZ + 1,
        visible: true,
      };

      pushHistory([...layers, textLayer]);
      setSelectedLayerId(textLayer.id);
    },
    [layers, dims, pushHistory],
  );

  // ── Add Image ────────────────────────────────────────────────────────

  const addImage = useCallback(
    (dataUrl: string) => {
      const maxZ = Math.max(...layers.map((l) => l.zIndex), 0);
      const size = Math.min(dims.width, dims.height) * 0.4;
      const imageLayer: MediaKitLayer = {
        id: genId(),
        type: "image",
        x: Math.round((dims.width - size) / 2),
        y: Math.round((dims.height - size) / 2),
        width: Math.round(size),
        height: Math.round(size),
        rotation: 0,
        imageUrl: dataUrl,
        zIndex: maxZ + 1,
        visible: true,
      };

      pushHistory([...layers, imageLayer]);
      setSelectedLayerId(imageLayer.id);
    },
    [layers, dims, pushHistory],
  );

  // ── Update Layer ─────────────────────────────────────────────────────

  const updateLayer = useCallback(
    (layerId: string, partial: Partial<MediaKitLayer>) => {
      const updated = layers.map((l) =>
        l.id === layerId ? { ...l, ...partial, id: l.id, type: l.type } : l,
      );
      pushHistory(updated);
    },
    [layers, pushHistory],
  );

  // ── Remove Layer ─────────────────────────────────────────────────────

  const removeLayer = useCallback(
    (layerId: string) => {
      const target = layers.find((l) => l.id === layerId);
      if (!target || target.type === "background") return;

      pushHistory(layers.filter((l) => l.id !== layerId));
      if (selectedLayerId === layerId) setSelectedLayerId(null);
    },
    [layers, selectedLayerId, pushHistory],
  );

  // ── Reorder Layer ────────────────────────────────────────────────────

  const reorderLayer = useCallback(
    (layerId: string, direction: "up" | "down") => {
      const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex((l) => l.id === layerId);
      if (idx < 0) return;

      // Don't move background (index 0) or move non-bg below bg
      const targetIdx = direction === "up" ? idx + 1 : idx - 1;
      if (targetIdx < 1 || targetIdx >= sorted.length) return;

      // Swap zIndex values
      const reordered = sorted.map((l, i) => {
        if (i === idx) return { ...l, zIndex: sorted[targetIdx].zIndex };
        if (i === targetIdx) return { ...l, zIndex: sorted[idx].zIndex };
        return l;
      });

      pushHistory(reordered);
    },
    [layers, pushHistory],
  );

  // ── Select Layer ─────────────────────────────────────────────────────

  const selectLayer = useCallback((layerId: string | null) => {
    setSelectedLayerId(layerId);
  }, []);

  // ── Undo / Reset ─────────────────────────────────────────────────────

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      return {
        past: prev.past.slice(0, -1),
        current: previous,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setHistory({
      past: [],
      current: [createDefaultBackground()],
    });
    setSelectedCubId(null);
    setSelectedLayerId(null);
  }, []);

  const canUndo = history.past.length > 0;
  const hasChanges = history.past.length > 0;

  return {
    mode,
    setMode,
    canvasWidth: dims.width,
    canvasHeight: dims.height,
    layers,
    selectedLayerId,
    selectedLayer,
    selectedCubId,
    selectCub,
    setBackground,
    addOverlay,
    addText,
    addImage,
    updateLayer,
    removeLayer,
    reorderLayer,
    selectLayer,
    undo,
    reset,
    canUndo,
    hasChanges,
  };
}

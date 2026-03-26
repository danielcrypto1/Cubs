"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { EditorCanvas } from "@/components/editor/editor-canvas";
import type { EditorCanvasHandle } from "@/components/editor/editor-canvas";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { NftPicker } from "@/components/editor/nft-picker";
import { OverlayPicker } from "@/components/editor/overlay-picker";
import { BackgroundPicker } from "@/components/editor/background-picker";
import { TextTool } from "@/components/editor/text-tool";
import { ImageUploader } from "@/components/editor/image-uploader";
import { LayerControls } from "@/components/editor/layer-controls";
import { LayerPanel } from "@/components/editor/layer-panel";
import { useMediaKit } from "@/hooks/use-media-kit";
import { Button } from "@/components/ui/button";
import {
  fadeInUp,
  fadeInScale,
  staggerContainer,
  staggerItem,
  springGentle,
} from "@/lib/animations";
import type { EditorMode } from "@/types";

export default function EditorPage() {
  const kit = useMediaKit();
  const canvasRef = useRef<EditorCanvasHandle>(null);

  return (
    <div className="mx-auto max-w-7xl px-4">
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Media Kit"
          description="Create your brand with CUBS"
        />
      </motion.div>

      {/* Mode Tabs */}
      <motion.div variants={fadeInUp} className="mb-6 flex gap-2">
        {(["pfp", "banner"] as EditorMode[]).map((m) => (
          <div key={m} className="relative">
            <Button
              variant={kit.mode === m ? "default" : "outline"}
              size="sm"
              onClick={() => kit.setMode(m)}
              className="relative min-w-[100px] font-bold uppercase"
            >
              {m === "pfp" ? "PFP" : "Banner"}
            </Button>
            {kit.mode === m && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary"
                transition={springGentle}
              />
            )}
          </div>
        ))}
        <span className="ml-2 flex items-center text-xs text-muted-foreground">
          {kit.canvasWidth} × {kit.canvasHeight}
        </span>
      </motion.div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_260px]">
        {/* ── Left Sidebar ─────────────────────────────────────── */}
        <motion.div variants={fadeInUp} className="order-2 lg:order-1">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="sticky top-20 space-y-5 rounded-xl border border-border bg-card p-4"
          >
            <motion.div variants={staggerItem}>
              <NftPicker
                selectedCubId={kit.selectedCubId}
                onSelect={kit.selectCub}
              />
            </motion.div>

            <motion.div variants={staggerItem} className="border-t border-border pt-4">
              <OverlayPicker onAdd={kit.addOverlay} />
            </motion.div>

            <motion.div variants={staggerItem} className="border-t border-border pt-4">
              <BackgroundPicker onSelect={kit.setBackground} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Center: Canvas + Toolbar ─────────────────────────── */}
        <motion.div variants={fadeInScale} className="order-1 space-y-4 lg:order-2">
          <EditorCanvas
            ref={canvasRef}
            layers={kit.layers}
            canvasWidth={kit.canvasWidth}
            canvasHeight={kit.canvasHeight}
            selectedLayerId={kit.selectedLayerId}
          />
          <EditorToolbar
            canUndo={kit.canUndo}
            hasChanges={kit.hasChanges}
            onUndo={kit.undo}
            onReset={kit.reset}
            canvasRef={canvasRef}
            mode={kit.mode}
          />
        </motion.div>

        {/* ── Right Sidebar ────────────────────────────────────── */}
        <motion.div variants={fadeInUp} className="order-3">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="sticky top-20 space-y-5 rounded-xl border border-border bg-card p-4"
          >
            <motion.div variants={staggerItem}>
              <TextTool
                onAddText={kit.addText}
                selectedLayer={kit.selectedLayer}
                onUpdateLayer={kit.updateLayer}
              />
            </motion.div>

            <motion.div variants={staggerItem} className="border-t border-border pt-4">
              <ImageUploader onAddImage={kit.addImage} />
            </motion.div>

            <AnimatePresence>
              {kit.selectedLayer && kit.selectedLayer.type !== "background" && (
                <motion.div
                  key="layer-controls"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-border pt-4"
                >
                  <LayerControls
                    layer={kit.selectedLayer}
                    canvasWidth={kit.canvasWidth}
                    canvasHeight={kit.canvasHeight}
                    onUpdate={kit.updateLayer}
                    onRemove={kit.removeLayer}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={staggerItem} className="border-t border-border pt-4">
              <LayerPanel
                layers={kit.layers}
                selectedLayerId={kit.selectedLayerId}
                onSelect={kit.selectLayer}
                onReorder={kit.reorderLayer}
                onUpdate={kit.updateLayer}
                onRemove={kit.removeLayer}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
    </div>
  );
}

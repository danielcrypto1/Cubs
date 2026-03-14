"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { CubSelector } from "@/components/editor/cub-selector";
import { EditorCanvas } from "@/components/editor/editor-canvas";
import { TraitPanel } from "@/components/editor/trait-panel";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { useEditor } from "@/hooks/use-editor";
import { useUserTraits } from "@/hooks/use-user-traits";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditorPage() {
  const [selectedCubId, setSelectedCubId] = useState<string | null>(null);
  const editor = useEditor();
  const { data: userTraits, refetch: refetchTraits } = useUserTraits();

  const handleSelectCub = async (cubId: string) => {
    setSelectedCubId(cubId);
    await editor.loadCub(cubId);
  };

  const handleBack = () => {
    setSelectedCubId(null);
  };

  const handleSave = async () => {
    const result = await editor.save();
    if (result) {
      refetchTraits();
      await editor.loadCub(result.cubId);
    }
  };

  return (
    <div>
      <PageHeader
        title="Cub Editor"
        description="Customize your Cubs with new traits and accessories"
      />

      {!selectedCubId ? (
        <CubSelector onSelect={handleSelectCub} />
      ) : (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Cubs
          </Button>

          {editor.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {editor.error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
            {/* Trait panel (left sidebar) */}
            <div className="order-2 lg:order-1">
              <div className="sticky top-20 rounded-lg border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold">Trait Inventory</h3>
                <TraitPanel
                  userTraits={userTraits}
                  layers={editor.layers}
                  onApplyTrait={editor.applyTrait}
                  onRemoveTrait={editor.removeTrait}
                />
              </div>
            </div>

            {/* Canvas + toolbar (right) */}
            <div className="order-1 space-y-4 lg:order-2">
              <EditorCanvas layers={editor.layers} />
              <EditorToolbar
                canUndo={editor.canUndo}
                hasChanges={editor.hasChanges}
                saving={editor.saving}
                onUndo={editor.undo}
                onReset={editor.reset}
                onSave={handleSave}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Undo2, RotateCcw, Save } from "lucide-react";

interface EditorToolbarProps {
  canUndo: boolean;
  hasChanges: boolean;
  saving: boolean;
  onUndo: () => void;
  onReset: () => void;
  onSave: () => void;
}

export function EditorToolbar({
  canUndo,
  hasChanges,
  saving,
  onUndo,
  onReset,
  onSave,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo || saving}
      >
        <Undo2 className="mr-1.5 h-4 w-4" />
        Undo
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        disabled={!hasChanges || saving}
      >
        <RotateCcw className="mr-1.5 h-4 w-4" />
        Reset
      </Button>

      <div className="flex-1" />

      <Button
        size="sm"
        onClick={onSave}
        disabled={!hasChanges || saving}
      >
        <Save className="mr-1.5 h-4 w-4" />
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}

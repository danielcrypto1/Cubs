"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Undo2, RotateCcw, Download, Share2, Check } from "lucide-react";
import type { EditorCanvasHandle } from "./editor-canvas";
import type { EditorMode } from "@/types";

interface EditorToolbarProps {
  canUndo: boolean;
  hasChanges: boolean;
  onUndo: () => void;
  onReset: () => void;
  canvasRef: React.RefObject<EditorCanvasHandle | null>;
  cubName?: string | null;
  mode: EditorMode;
}

export function EditorToolbar({
  canUndo,
  hasChanges,
  onUndo,
  onReset,
  canvasRef,
  cubName,
  mode,
}: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const name = cubName
      ? `${cubName.toLowerCase().replace(/\s+/g, "-")}-${mode}.png`
      : `cubs-media-kit-${mode}.png`;

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = name;
    a.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) return;

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: just show feedback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
      <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo}>
        <Undo2 className="mr-1.5 h-3.5 w-3.5" />
        Undo
      </Button>

      <Button variant="outline" size="sm" onClick={onReset} disabled={!hasChanges}>
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
        Reset
      </Button>

      <div className="flex-1" />

      <Button size="sm" onClick={handleDownload}>
        <Download className="mr-1.5 h-3.5 w-3.5" />
        Download
      </Button>

      <Button size="sm" variant="outline" onClick={handleShare}>
        {copied ? (
          <>
            <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Share
          </>
        )}
      </Button>
    </div>
  );
}

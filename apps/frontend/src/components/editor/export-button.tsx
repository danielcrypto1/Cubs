"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { EditorCanvasHandle } from "./editor-canvas";

interface ExportButtonProps {
  canvasRef: React.RefObject<EditorCanvasHandle | null>;
  cubName?: string | null;
}

export function ExportButton({ canvasRef, cubName }: ExportButtonProps) {
  const handleExport = () => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${(cubName ?? "cub").toLowerCase().replace(/\s+/g, "-")}-cub.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-1.5 h-4 w-4" />
      Export PNG
    </Button>
  );
}

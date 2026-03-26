"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MOCK_FONTS, TEXT_COLORS } from "@/lib/media-kit-data";
import type { MediaKitLayer } from "@/types";
import { Type } from "lucide-react";

interface TextToolProps {
  onAddText: (opts: {
    text: string;
    fontFamily: string;
    fontSize: number;
    fontColor: string;
  }) => void;
  selectedLayer: MediaKitLayer | null;
  onUpdateLayer: (id: string, partial: Partial<MediaKitLayer>) => void;
}

export function TextTool({ onAddText, selectedLayer, onUpdateLayer }: TextToolProps) {
  const [text, setText] = useState("CUBS");
  const [fontFamily, setFontFamily] = useState("Lilita One");
  const [fontSize, setFontSize] = useState(64);
  const [fontColor, setFontColor] = useState("#ffffff");

  const isEditing = selectedLayer?.type === "text";

  const handleAdd = () => {
    if (!text.trim()) return;
    onAddText({ text, fontFamily, fontSize, fontColor });
  };

  const handleUpdate = (field: string, value: string | number) => {
    if (!isEditing || !selectedLayer) return;
    onUpdateLayer(selectedLayer.id, { [field]: value });
  };

  const activeText = isEditing ? selectedLayer.text ?? "" : text;
  const activeFont = isEditing ? selectedLayer.fontFamily ?? fontFamily : fontFamily;
  const activeSize = isEditing ? selectedLayer.fontSize ?? fontSize : fontSize;
  const activeColor = isEditing ? selectedLayer.fontColor ?? fontColor : fontColor;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Add Text
      </h3>

      {/* Text Input */}
      <input
        type="text"
        value={activeText}
        onChange={(e) => {
          if (isEditing) handleUpdate("text", e.target.value);
          else setText(e.target.value);
        }}
        placeholder="Enter text..."
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />

      {/* Font Family */}
      <select
        value={activeFont}
        onChange={(e) => {
          if (isEditing) handleUpdate("fontFamily", e.target.value);
          else setFontFamily(e.target.value);
        }}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      >
        {MOCK_FONTS.map((f) => (
          <option key={f.family} value={f.family}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Font Size */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Size</span>
          <span className="text-[10px] font-medium">{activeSize}px</span>
        </div>
        <input
          type="range"
          min={12}
          max={120}
          value={activeSize}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (isEditing) handleUpdate("fontSize", v);
            else setFontSize(v);
          }}
          className="w-full accent-primary"
        />
      </div>

      {/* Color Swatches */}
      <div>
        <span className="mb-1.5 block text-[10px] text-muted-foreground">Color</span>
        <div className="flex flex-wrap gap-1.5">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => {
                if (isEditing) handleUpdate("fontColor", color);
                else setFontColor(color);
              }}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                activeColor === color ? "border-primary scale-110" : "border-border"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {!isEditing && (
        <Button size="sm" className="w-full" onClick={handleAdd} disabled={!text.trim()}>
          <Type className="mr-1.5 h-3.5 w-3.5" />
          Add Text
        </Button>
      )}
    </div>
  );
}

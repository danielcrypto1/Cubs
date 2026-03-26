"use client";

import Image from "next/image";
import { MOCK_SCENES } from "@/lib/mock-data";
import { X } from "lucide-react";

interface SceneSelectorProps {
  activeSceneId: string | null;
  onSelect: (sceneId: string | null) => void;
}

export function SceneSelector({ activeSceneId, onSelect }: SceneSelectorProps) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Scene Background
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {/* None option */}
        <button
          onClick={() => onSelect(null)}
          className={`flex aspect-square items-center justify-center rounded-lg border text-xs transition-colors ${
            activeSceneId === null
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50"
          }`}
        >
          <X className="h-4 w-4" />
        </button>

        {MOCK_SCENES.map((scene) => (
          <button
            key={scene.id}
            onClick={() => onSelect(scene.id)}
            className={`relative aspect-square overflow-hidden rounded-lg border transition-all ${
              activeSceneId === scene.id
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Image
              src={scene.thumbnailUrl}
              alt={scene.name}
              fill
              unoptimized
              className="object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-center text-[10px] font-medium text-white">
              {scene.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

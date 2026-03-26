"use client";

import Image from "next/image";
import { MOCK_CUBS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

interface CubSelectorProps {
  onSelect: (cubId: string) => void;
}

export function CubSelector({ onSelect }: CubSelectorProps) {
  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Select a Cub to customize
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {MOCK_CUBS.map((cub) => (
          <button
            key={cub.id}
            onClick={() => onSelect(cub.id)}
            className="cubs-card-hover group overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:border-primary/50"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={cub.imageUrl}
                alt={cub.name}
                fill
                unoptimized
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <p className="font-bold">{cub.name}</p>
              <p className="text-xs text-muted-foreground">Token #{cub.tokenId}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {cub.traits.slice(0, 2).map((t) => (
                  <Badge key={t.category} variant="outline" className="text-[10px]">
                    {t.value}
                  </Badge>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

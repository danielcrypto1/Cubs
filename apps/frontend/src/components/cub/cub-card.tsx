"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Cub } from "@/types";

interface CubCardProps {
  cub: Cub;
  onClick?: () => void;
}

export function CubCard({ cub, onClick }: CubCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="cursor-pointer overflow-hidden cubs-card-hover"
        onClick={onClick}
      >
        <div className="relative aspect-square cubs-image-zoom">
          {cub.imageUrl ? (
            <Image
              src={cub.imageUrl}
              alt={cub.name || `Cub #${cub.tokenId}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
        </div>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {cub.name || `Cub #${cub.tokenId}`}
            </CardTitle>
            <Badge variant="outline">#{cub.tokenId}</Badge>
          </div>
        </CardHeader>
        {cub.equippedTraits && cub.equippedTraits.length > 0 && (
          <CardContent className="px-4 pb-4 pt-0">
            <div className="flex flex-wrap gap-1">
              {cub.equippedTraits.slice(0, 3).map((eq) => (
                <Badge key={eq.id} variant="secondary" className="text-xs">
                  {eq.traitDefinition?.name ?? eq.slotCategory}
                </Badge>
              ))}
              {cub.equippedTraits.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{cub.equippedTraits.length - 3}
                </Badge>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

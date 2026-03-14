"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TraitList } from "./trait-list";
import type { Cub } from "@/types";

interface CubViewerProps {
  cub: Cub;
}

export function CubViewer({ cub }: CubViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="grid gap-6 md:grid-cols-2"
    >
      {/* Image */}
      <Card className="overflow-hidden">
        <div className="relative aspect-square">
          {cub.imageUrl ? (
            <Image
              src={cub.imageUrl}
              alt={cub.name || `Cub #${cub.tokenId}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <span className="text-lg text-muted-foreground">No Image</span>
            </div>
          )}
        </div>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {cub.name || `Cub #${cub.tokenId}`}
            </CardTitle>
            <Badge>#{cub.tokenId}</Badge>
          </div>
          {cub.description && (
            <p className="text-sm text-muted-foreground">{cub.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Traits
          </h3>
          <TraitList traits={cub.traits || []} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

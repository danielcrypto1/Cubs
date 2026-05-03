"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { popIn } from "@/lib/animations";
import { Paintbrush, Save, ArrowLeft, Check } from "lucide-react";
import type { MockCub } from "@/lib/mock-data";

const TRAIT_CATEGORIES = ["Background", "Body", "Hat", "Eyes", "Outfit", "Mouth", "Special"];

interface ModifyPanelProps {
  cubs: MockCub[];
}

export function ModifyPanel({ cubs }: ModifyPanelProps) {
  const [selectedCub, setSelectedCub] = useState<MockCub | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!selectedCub) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Select a Cub to modify its traits.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cubs.map((cub) => (
            <Card
              key={cub.id}
              className="cursor-pointer overflow-hidden cubs-card-hover"
              onClick={() => setSelectedCub(cub)}
            >
              <div className="relative aspect-square cubs-image-zoom bg-muted">
                <Image src={cub.imageUrl} alt={cub.name} fill unoptimized className="object-cover" />
              </div>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{cub.name}</p>
                  <Badge variant="outline" className="text-[10px]">#{cub.tokenId}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => setSelectedCub(null)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to selection
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cub preview */}
        <Card className="overflow-hidden">
          <div className="relative aspect-square bg-muted">
            <Image
              src={selectedCub.imageUrl}
              alt={selectedCub.name}
              fill
              unoptimized
              className="object-cover"
            />
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={popIn}
                  className="absolute inset-0 flex items-center justify-center bg-background/60"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cubs-green">
                    <Check className="h-8 w-8 text-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <CardContent className="p-4">
            <p className="text-lg font-bold">{selectedCub.name}</p>
            <p className="text-sm text-muted-foreground">Token #{selectedCub.tokenId}</p>
          </CardContent>
        </Card>

        {/* Trait editor */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Traits</h3>
          {TRAIT_CATEGORIES.map((cat) => {
            const trait = selectedCub.traits.find((t) => t.category === cat);
            return (
              <div key={cat} className="flex items-center justify-between rounded-xl bg-card p-3 border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">{cat}</p>
                  <p className="text-sm font-medium">{trait?.value ?? "None"}</p>
                </div>
                {trait && (
                  <Badge
                    variant={trait.rarity.toLowerCase() as "common" | "uncommon" | "rare" | "epic" | "legendary"}
                    className="text-[10px]"
                  >
                    {trait.rarity}
                  </Badge>
                )}
              </div>
            );
          })}

          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Paintbrush className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

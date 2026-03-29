"use client";

import { useState, useCallback } from "react";
import { MOCK_CRATES } from "@/lib/mock-data";
import { rollCrate } from "@/lib/loot-engine";
import { traitStore } from "@/lib/trait-store";
import type { UserCrate, CrateOpenResult, CrateDefinition } from "@/types";

function buildUserCrates(): UserCrate[] {
  return MOCK_CRATES.map((mc) => ({
    id: mc.id,
    walletAddress: "0xMOCK",
    crateDefinitionId: mc.id,
    quantity: mc.quantity,
    acquiredAt: "2026-01-15T00:00:00Z",
    crateDefinition: {
      id: mc.id,
      name: mc.name,
      type: "STANDARD" as const,
      rarity: mc.rarity as CrateDefinition["rarity"],
      description: mc.description,
      imageUrl: mc.imageUrl,
      priceType: "PAWS" as const,
      priceAmount: "200",
      maxSupply: null,
      currentSupply: 0,
      activeFrom: null,
      activeUntil: null,
      isBase: false,
      dropId: null,
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
    },
  }));
}

export function useCrates() {
  const [data, setData] = useState<UserCrate[]>(buildUserCrates);

  const openCrate = useCallback(
    async (crateDefinitionId: string): Promise<CrateOpenResult> => {
      const mockCrate = MOCK_CRATES.find((c) => c.id === crateDefinitionId);
      if (!mockCrate) throw new Error("Crate not found");

      const loot = rollCrate(mockCrate.dropRates);

      // Add trait to shared store (syncs with editor)
      traitStore.addTrait(loot.traitDefinition);

      // Decrement crate quantity
      setData((prev) =>
        prev.map((c) =>
          c.crateDefinitionId === crateDefinitionId
            ? { ...c, quantity: Math.max(0, c.quantity - 1) }
            : c,
        ),
      );

      return {
        success: true,
        reward: {
          rewardType: "TRAIT" as const,
          traitDefinition: loot.traitDefinition,
          rarity: loot.rarity,
        },
        remainingCrates:
          (data.find((c) => c.crateDefinitionId === crateDefinitionId)
            ?.quantity ?? 1) - 1,
      };
    },
    [data],
  );

  return { data, loading: false, error: null, refetch: () => {}, openCrate };
}

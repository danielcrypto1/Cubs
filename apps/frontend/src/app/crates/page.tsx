"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CrateCard } from "@/components/crate/crate-card";
import { CrateOpenModal } from "@/components/crate/crate-open-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCrates } from "@/hooks/use-crates";
import { MOCK_CRATES } from "@/lib/mock-data";
import { CRATE_STAGE_TIMING } from "@/lib/animations";
import type { UserCrate, CrateOpenResult, CrateDefinition } from "@/types";

export default function CratesPage() {
  const router = useRouter();
  const { data: crates, loading, openCrate } = useCrates();
  const [openingCrateId, setOpeningCrateId] = useState<string | null>(null);
  const [modalCrate, setModalCrate] = useState<CrateDefinition | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [result, setResult] = useState<CrateOpenResult | null>(null);

  const handleOpen = async (userCrate: UserCrate) => {
    if (!userCrate.crateDefinition) return;

    const def = userCrate.crateDefinition;
    setModalCrate(def);
    setOpeningCrateId(userCrate.crateDefinitionId);
    setIsOpening(true);
    setResult(null);

    try {
      const res = await openCrate(userCrate.crateDefinitionId);
      // Delay the result so animation stages can play out
      const timing = CRATE_STAGE_TIMING[def.rarity] ?? CRATE_STAGE_TIMING.COMMON;
      setTimeout(() => {
        setResult(res);
        setIsOpening(false);
      }, timing.total);
    } catch {
      setIsOpening(false);
      setModalCrate(null);
    } finally {
      setOpeningCrateId(null);
    }
  };

  const handleCloseModal = useCallback(() => {
    setModalCrate(null);
    setResult(null);
    setIsOpening(false);
  }, []);

  const handleEquip = useCallback(
    (res: CrateOpenResult) => {
      handleCloseModal();
      // Navigate to forge/editor with the trait pre-selected
      if (res.reward.traitDefinition) {
        router.push(`/forge?equip=${res.reward.traitDefinition.id}`);
      }
    },
    [handleCloseModal, router],
  );

  const handleSell = useCallback(
    (res: CrateOpenResult) => {
      handleCloseModal();
      router.push("/marketplace?action=list");
    },
    [handleCloseModal, router],
  );

  const handleBurn = useCallback(
    (_res: CrateOpenResult) => {
      // TODO: integrate with burn endpoint
      handleCloseModal();
    },
    [handleCloseModal],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4">
        <PageHeader
          title="Crates"
          description="Open crates to discover new traits for your Cubs"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4">
      <PageHeader
        title="Crates"
        description="Open crates to discover new traits for your Cubs"
      />

      {crates.length === 0 ? (
        <EmptyState
          title="No Crates"
          description="You don't have any crates yet. Earn them through gameplay or purchase on the marketplace."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {crates.map((crate) =>
            crate.crateDefinition ? (
              <CrateCard
                key={crate.id}
                crateDefinition={crate.crateDefinition}
                quantity={crate.quantity}
                dropRates={MOCK_CRATES.find((mc) => mc.id === crate.crateDefinitionId)?.dropRates}
                onOpen={() => handleOpen(crate)}
                isOpening={openingCrateId === crate.crateDefinitionId}
              />
            ) : null,
          )}
        </div>
      )}

      <CrateOpenModal
        crateDefinition={modalCrate}
        isOpening={isOpening}
        result={result}
        onClose={handleCloseModal}
        onEquip={handleEquip}
        onSell={handleSell}
        onBurn={handleBurn}
      />
    </div>
  );
}

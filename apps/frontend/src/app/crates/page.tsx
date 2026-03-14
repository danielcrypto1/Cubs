"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { CrateCard } from "@/components/crate/crate-card";
import { CrateOpenModal } from "@/components/crate/crate-open-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCrates } from "@/hooks/use-crates";
import type { UserCrate, CrateOpenResult, CrateDefinition } from "@/types";

export default function CratesPage() {
  const { data: crates, loading, openCrate } = useCrates();
  const [openingCrateId, setOpeningCrateId] = useState<string | null>(null);
  const [modalCrate, setModalCrate] = useState<CrateDefinition | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [result, setResult] = useState<CrateOpenResult | null>(null);

  const handleOpen = async (userCrate: UserCrate) => {
    if (!userCrate.crateDefinition) return;

    setModalCrate(userCrate.crateDefinition);
    setOpeningCrateId(userCrate.crateDefinitionId);
    setIsOpening(true);
    setResult(null);

    try {
      const res = await openCrate(userCrate.crateDefinitionId);
      // Delay reveal for animation
      setTimeout(() => {
        setResult(res);
        setIsOpening(false);
      }, 1500);
    } catch {
      setIsOpening(false);
      setModalCrate(null);
    } finally {
      setOpeningCrateId(null);
    }
  };

  const handleCloseModal = () => {
    setModalCrate(null);
    setResult(null);
    setIsOpening(false);
  };

  if (loading) {
    return (
      <div>
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
    <div>
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
      />
    </div>
  );
}

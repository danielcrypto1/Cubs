"use client";

import Link from "next/link";
import { useCubs } from "@/hooks/use-cubs";
import { CubCard } from "@/components/cub/cub-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";

interface CubSelectorProps {
  onSelect: (cubId: string) => void;
}

export function CubSelector({ onSelect }: CubSelectorProps) {
  const { address } = useAccount();
  const { data, loading } = useCubs(address);
  const cubs = data?.cubs ?? [];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (cubs.length === 0) {
    return (
      <EmptyState
        title="No Cubs Found"
        description="You don't own any Cubs yet. Mint one to get started!"
        action={
          <Button asChild>
            <Link href="/mint">Go to Mint</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Select a Cub to customize
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {cubs.map((cub) => (
          <CubCard key={cub.id} cub={cub} onClick={() => onSelect(cub.id)} />
        ))}
      </div>
    </div>
  );
}

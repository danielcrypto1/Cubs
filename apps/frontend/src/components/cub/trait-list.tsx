import { Badge } from "@/components/ui/badge";
import type { CubEquippedTrait } from "@/types";

interface TraitListProps {
  equippedTraits: CubEquippedTrait[];
}

export function TraitList({ equippedTraits }: TraitListProps) {
  if (equippedTraits.length === 0) {
    return <p className="text-sm text-muted-foreground">No traits</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {equippedTraits.map((eq) => (
        <div
          key={eq.id}
          className="rounded-lg border border-border bg-secondary/50 p-2"
        >
          <p className="text-xs text-muted-foreground">{eq.slotCategory}</p>
          <Badge variant="secondary" className="mt-1">
            {eq.traitDefinition?.name ?? "Unknown"}
          </Badge>
        </div>
      ))}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import type { Trait } from "@/types";

interface TraitListProps {
  traits: Trait[];
}

export function TraitList({ traits }: TraitListProps) {
  if (traits.length === 0) {
    return <p className="text-sm text-muted-foreground">No traits</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {traits.map((trait) => (
        <div
          key={trait.id}
          className="rounded-lg border border-border bg-secondary/50 p-2"
        >
          <p className="text-xs text-muted-foreground">{trait.traitType}</p>
          <Badge variant="secondary" className="mt-1">
            {trait.traitValue}
          </Badge>
        </div>
      ))}
    </div>
  );
}

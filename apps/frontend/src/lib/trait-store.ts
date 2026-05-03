import { MOCK_USER_TRAITS } from "@/lib/mock-data";
import type { UserTrait, TraitDefinition } from "@/types";

type Listener = () => void;

let traits: UserTrait[] = [...MOCK_USER_TRAITS];
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export const traitStore = {
  getTraits(): UserTrait[] {
    return traits;
  },

  addTrait(traitDefinition: TraitDefinition): void {
    const existing = traits.find(
      (t) => t.traitDefinitionId === traitDefinition.id,
    );

    if (existing) {
      traits = traits.map((t) =>
        t.traitDefinitionId === traitDefinition.id
          ? { ...t, quantity: t.quantity + 1 }
          : t,
      );
    } else {
      traits = [
        ...traits,
        {
          id: `ut-crate-${Date.now()}`,
          walletAddress: "0xMOCK",
          traitDefinitionId: traitDefinition.id,
          quantity: 1,
          acquiredFrom: "CRATE",
          acquiredAt: new Date().toISOString(),
          traitDefinition,
        },
      ];
    }

    notify();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

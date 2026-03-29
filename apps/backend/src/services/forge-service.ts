import { prisma } from "../lib/prisma.js";
import { withIntent } from "./transaction-intent-service.js";
import { validateTraitOwnership, decrementUserTrait } from "./user-trait-service.js";
import { autoClaimAndUpdateSnapshot } from "./staking-service.js";
import { calculateRarityScore, updateCubRarityScore, estimateRank } from "./rarity-service.js";
import { economyEvents } from "../lib/economy-events.js";
import { renderQueue } from "../lib/queue.js";
import { TRAIT_LAYER_ORDER } from "@cubs/shared";
import type { Prisma, TraitCategory } from "@prisma/client";
import type {
  ForgeChange,
  ForgePreviewResult,
  ForgeApplyResult,
  CubVersionTraitEntry,
  TraitCategory as SharedTraitCategory,
} from "@cubs/shared";

// ─── Forge Service ────────────────────────────────────
//
// Two modes:
//   1. PREVIEW — read-only, returns composed traits + rarity + rank
//   2. APPLY  — destructive: burns traits, updates cub, creates version
//
// Apply is protected by:
//   - transaction intent (prevents double-forge)
//   - advisory lock (prevents concurrent mutations)
//   - trait ownership validation inside transaction
// ─────────────────────────────────────────────────────────

// ─── Onsie Rule ───────────────────────────────────────
//
// When an "Onsie" (onesie/full-body outfit) is equipped in
// the OUTFIT slot, it visually covers SHOES, ACCESSORIES,
// and HAT. These slots are automatically cleared.
// ─────────────────────────────────────────────────────────

const ONSIE_CLEARED_SLOTS: TraitCategory[] = ["SHOES", "ACCESSORIES", "HAT"];

function isOnsie(traitName: string): boolean {
  const lower = traitName.toLowerCase();
  return lower.includes("onsie") || lower.includes("onesie");
}

// ─── Error Class ──────────────────────────────────────

export class ForgeError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ForgeError";
  }
}

// ─── Advisory Lock (same FNV-1a as paws-service) ──────

function userLockId(userId: string): bigint {
  let h = 0xcbf29ce484222325n;
  for (let i = 0; i < userId.length; i++) {
    h ^= BigInt(userId.charCodeAt(i));
    h = (h * 0x100000001b3n) & 0x7fffffffffffffffn;
  }
  return h;
}

async function acquireLock(tx: Prisma.TransactionClient, userId: string): Promise<void> {
  const lockId = userLockId(userId);
  await tx.$queryRawUnsafe(`SELECT pg_advisory_xact_lock(${lockId})`);
}

// ─── Preview Mode (NO side effects) ──────────────────

/**
 * Computes what a forge would produce WITHOUT writing to DB.
 * Safe to call repeatedly — purely read-only.
 */
export async function getForgePreview(
  cubId: string,
  walletAddress: string,
  changes: ForgeChange[],
): Promise<ForgePreviewResult> {
  const address = walletAddress.toLowerCase();

  // Load cub with current equipped traits
  const cub = await prisma.cub.findUnique({
    where: { id: cubId },
    include: {
      equippedTraits: { include: { traitDefinition: true } },
      owner: true,
    },
  });

  if (!cub) throw new ForgeError("CUB_NOT_FOUND", "Cub not found");
  if (cub.owner.walletAddress !== address) {
    throw new ForgeError("NOT_OWNER", "You do not own this cub");
  }

  // Build current trait map: slot → traitDefinition
  const slotMap = new Map<string, { traitDefinitionId: string; name: string; imageUrl: string; rarity: string; rarityWeight: number; category: string }>();
  for (const eq of cub.equippedTraits) {
    slotMap.set(eq.slotCategory, {
      traitDefinitionId: eq.traitDefinitionId,
      name: eq.traitDefinition.name,
      imageUrl: eq.traitDefinition.imageUrl,
      rarity: eq.traitDefinition.rarity,
      rarityWeight: eq.traitDefinition.rarityWeight,
      category: eq.traitDefinition.category,
    });
  }

  // Apply proposed changes
  const traitDefsToLoad: string[] = [];
  for (const change of changes) {
    if (change.traitDefinitionId) {
      traitDefsToLoad.push(change.traitDefinitionId);
    }
  }

  const traitDefs = traitDefsToLoad.length > 0
    ? await prisma.traitDefinition.findMany({ where: { id: { in: traitDefsToLoad } } })
    : [];
  const traitDefMap = new Map(traitDefs.map((td) => [td.id, td]));

  // Track onsie conflicts
  const onsieConflicts: SharedTraitCategory[] = [];

  for (const change of changes) {
    if (change.traitDefinitionId === null) {
      // Unequip slot
      slotMap.delete(change.slot);
    } else {
      const def = traitDefMap.get(change.traitDefinitionId);
      if (!def) throw new ForgeError("TRAIT_NOT_FOUND", `Trait definition ${change.traitDefinitionId} not found`);
      if (def.category !== change.slot) {
        throw new ForgeError("SLOT_MISMATCH", `Trait ${def.name} belongs to ${def.category}, not ${change.slot}`);
      }

      slotMap.set(change.slot, {
        traitDefinitionId: def.id,
        name: def.name,
        imageUrl: def.imageUrl,
        rarity: def.rarity,
        rarityWeight: def.rarityWeight,
        category: def.category,
      });

      // Onsie rule: if equipping an onsie in OUTFIT, clear covered slots
      if (change.slot === "OUTFIT" && isOnsie(def.name)) {
        for (const clearedSlot of ONSIE_CLEARED_SLOTS) {
          if (slotMap.has(clearedSlot)) {
            onsieConflicts.push(clearedSlot as SharedTraitCategory);
          }
          slotMap.delete(clearedSlot);
        }
      }
    }
  }

  // Build composed trait list
  const composedTraits: CubVersionTraitEntry[] = [];
  for (const category of TRAIT_LAYER_ORDER) {
    const trait = slotMap.get(category);
    if (trait) {
      composedTraits.push({
        slotCategory: category as SharedTraitCategory,
        traitDefinitionId: trait.traitDefinitionId,
        name: trait.name,
        imageUrl: trait.imageUrl,
      });
    }
  }

  // Calculate rarity score from composed traits
  const rarityTraits = Array.from(slotMap.values()).map((t) => ({
    rarity: t.rarity,
    rarityWeight: t.rarityWeight,
    category: t.category,
  }));
  const rarityScore = calculateRarityScore(rarityTraits);

  // Estimate rank
  const { rank } = await estimateRank(rarityScore);

  return {
    cubId,
    composedTraits,
    rarityScore,
    rankEstimate: rank,
    onsieConflicts,
  };
}

// ─── Apply Mode (DESTRUCTIVE) ────────────────────────

/**
 * Applies forge changes to a cub. Protected by intent + advisory lock.
 *
 * Flow:
 *   1. Create transaction intent (prevents double-forge)
 *   2. Inside transaction:
 *      a. Advisory lock on user
 *      b. Validate cub ownership
 *      c. Validate trait ownership for all new equips
 *      d. Auto-claim staking PAWS (snapshot will change)
 *      e. Burn traits from inventory (decrement/delete)
 *      f. Upsert equipped traits
 *      g. Calculate + persist rarity score
 *      h. Increment cub version + create CubVersion snapshot
 *   3. Enqueue async render job
 *   4. Emit events
 */
export async function applyForge(
  userId: string,
  cubId: string,
  walletAddress: string,
  changes: ForgeChange[],
): Promise<ForgeApplyResult> {
  if (changes.length === 0) {
    throw new ForgeError("NO_CHANGES", "No forge changes provided");
  }

  return withIntent(userId, "FORGE_SAVE", cubId, async () => {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Advisory lock — serialise all forge operations for this user
      await acquireLock(tx, userId);

      const address = walletAddress.toLowerCase();

      // 2. Validate cub ownership
      const cub = await tx.cub.findUnique({
        where: { id: cubId },
        include: {
          equippedTraits: { include: { traitDefinition: true } },
          owner: true,
        },
      });

      if (!cub) throw new ForgeError("CUB_NOT_FOUND", "Cub not found");
      if (cub.owner.walletAddress !== address) {
        throw new ForgeError("NOT_OWNER", "You do not own this cub");
      }

      // 3. Load trait definitions for all changes
      const newTraitIds = changes
        .filter((c) => c.traitDefinitionId !== null)
        .map((c) => c.traitDefinitionId!);

      const traitDefs = newTraitIds.length > 0
        ? await tx.traitDefinition.findMany({ where: { id: { in: newTraitIds } } })
        : [];
      const traitDefMap = new Map(traitDefs.map((td) => [td.id, td]));

      // Validate all trait definitions exist and match slots
      for (const change of changes) {
        if (change.traitDefinitionId) {
          const def = traitDefMap.get(change.traitDefinitionId);
          if (!def) throw new ForgeError("TRAIT_NOT_FOUND", `Trait ${change.traitDefinitionId} not found`);
          if (def.category !== change.slot) {
            throw new ForgeError("SLOT_MISMATCH", `Trait ${def.name} belongs to ${def.category}, not ${change.slot}`);
          }
        }
      }

      // 4. Build current equipped map
      const currentEquipped = new Map<string, string>(); // slot → traitDefinitionId
      for (const eq of cub.equippedTraits) {
        currentEquipped.set(eq.slotCategory, eq.traitDefinitionId);
      }

      // 5. Determine which traits need to be burned (newly equipped, not re-equips)
      const traitsToBurn: Array<{ traitDefinitionId: string; name: string; slot: TraitCategory }> = [];
      const slotsToUpdate = new Map<string, string | null>(); // slot → traitDefId or null (unequip)

      // Apply onsie rule first to determine full set of changes
      let onsieActive = false;
      for (const change of changes) {
        if (change.slot === "OUTFIT" && change.traitDefinitionId) {
          const def = traitDefMap.get(change.traitDefinitionId)!;
          if (isOnsie(def.name)) {
            onsieActive = true;
            break;
          }
        }
      }

      // Process explicit changes
      for (const change of changes) {
        slotsToUpdate.set(change.slot, change.traitDefinitionId);
      }

      // Onsie rule: force-clear covered slots
      if (onsieActive) {
        for (const clearedSlot of ONSIE_CLEARED_SLOTS) {
          if (!slotsToUpdate.has(clearedSlot)) {
            slotsToUpdate.set(clearedSlot, null); // auto-unequip
          }
        }
      }

      // 6. Validate ownership + determine burns
      for (const [slot, traitDefId] of slotsToUpdate) {
        if (traitDefId === null) continue; // unequip — no burn needed

        const alreadyEquipped = currentEquipped.get(slot) === traitDefId;
        if (alreadyEquipped) continue; // same trait in same slot — no burn

        // Validate the user owns this trait
        const owns = await validateTraitOwnership(address, traitDefId, tx);
        if (!owns) {
          const def = traitDefMap.get(traitDefId)!;
          throw new ForgeError("TRAIT_NOT_OWNED", `You do not own trait "${def.name}"`);
        }

        const def = traitDefMap.get(traitDefId)!;
        traitsToBurn.push({
          traitDefinitionId: traitDefId,
          name: def.name,
          slot: slot as TraitCategory,
        });
      }

      // 7. Auto-claim staking PAWS before snapshot changes
      await autoClaimAndUpdateSnapshot(cubId, tx);

      // 8. Burn traits from inventory
      for (const burn of traitsToBurn) {
        await decrementUserTrait(address, burn.traitDefinitionId, tx);
      }

      // 9. Update equipped traits
      // Delete slots that are being changed
      const slotsChanged = Array.from(slotsToUpdate.keys()) as TraitCategory[];
      if (slotsChanged.length > 0) {
        await tx.cubEquippedTrait.deleteMany({
          where: { cubId, slotCategory: { in: slotsChanged } },
        });
      }

      // Create new equips
      const newEquips = Array.from(slotsToUpdate.entries())
        .filter(([, defId]) => defId !== null)
        .map(([slot, defId]) => ({
          cubId,
          slotCategory: slot as TraitCategory,
          traitDefinitionId: defId!,
        }));

      if (newEquips.length > 0) {
        await tx.cubEquippedTrait.createMany({ data: newEquips });
      }

      // 10. Recalculate rarity score
      const rarityScore = await updateCubRarityScore(cubId, tx);

      // 11. Increment version + create snapshot
      const newVersion = cub.version + 1;

      // Reload all equipped traits for snapshot
      const allEquipped = await tx.cubEquippedTrait.findMany({
        where: { cubId },
        include: { traitDefinition: true },
      });

      const traitSnapshot = allEquipped.map((eq) => ({
        slotCategory: eq.slotCategory as string,
        traitDefinitionId: eq.traitDefinitionId,
        name: eq.traitDefinition.name,
        imageUrl: eq.traitDefinition.imageUrl,
      }));

      await tx.cubVersion.create({
        data: {
          cubId,
          version: newVersion,
          imageUrl: cub.imageUrl ?? "",
          metadataUri: cub.metadataUri ?? "",
          traitSnapshot,
          rarityScore,
        },
      });

      await tx.cub.update({
        where: { id: cubId },
        data: { version: newVersion },
      });

      return {
        cubId,
        version: newVersion,
        imageUrl: cub.imageUrl ?? "",
        metadataUri: cub.metadataUri ?? "",
        rarityScore,
        traitsBurned: traitsToBurn,
        traitSnapshot,
        address,
      };
    });

    // 12. Enqueue async render job (outside transaction, non-blocking)
    renderQueue.add(`render:${cubId}:v${result.version}`, {
      cubId,
      version: result.version,
      layers: result.traitSnapshot.map((t) => ({
        slotCategory: t.slotCategory as SharedTraitCategory,
        traitDefinitionId: t.traitDefinitionId,
        imageUrl: t.imageUrl,
      })),
      requestedBy: result.address,
    }).catch((err) => {
      console.error("Failed to enqueue render job (non-critical):", err);
    });

    // 13. Emit events (fire-and-forget)
    economyEvents.emit("cub_forged", {
      userId,
      data: {
        cubId,
        version: result.version,
        rarityScore: result.rarityScore,
        traitsBurned: result.traitsBurned.length,
      },
    });

    for (const burn of result.traitsBurned) {
      economyEvents.emit("trait_burned", {
        userId,
        data: {
          traitDefinitionId: burn.traitDefinitionId,
          name: burn.name,
          slot: burn.slot,
        },
      });
    }

    economyEvents.emit("rarity_updated", {
      userId,
      data: {
        cubId,
        rarityScore: result.rarityScore,
      },
    });

    economyEvents.emit("render_requested", {
      userId,
      data: { cubId, version: result.version },
    });

    return {
      cubId: result.cubId,
      version: result.version,
      imageUrl: result.imageUrl,
      metadataUri: result.metadataUri,
      rarityScore: result.rarityScore,
      traitsBurned: result.traitsBurned,
    };
  });
}

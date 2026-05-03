import { prisma } from "../lib/prisma.js";
import { economyEvents } from "../lib/economy-events.js";
import type { DropStatus } from "@prisma/client";

// ─── Drop Service ─────────────────────────────────────
//
// Manages drop lifecycle: DRAFT → SCHEDULED → LIVE → ENDED.
// Status is computed from time + explicit status field.
// Admin can override status, but time-based transitions
// are the primary mechanism.
// ─────────────────────────────────────────────────────────

export class DropError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "DropError";
  }
}

/**
 * Computes the effective status of a drop based on current time.
 * If admin has explicitly set DRAFT or ENDED, those are respected.
 * Otherwise, derives from startTime/endTime.
 */
export function computeDropStatus(drop: {
  status: DropStatus;
  startTime: Date | null;
  endTime: Date | null;
}): DropStatus {
  // Admin overrides
  if (drop.status === "DRAFT" || drop.status === "ENDED") return drop.status;

  const now = new Date();

  if (drop.endTime && now >= drop.endTime) return "ENDED";
  if (drop.startTime && now >= drop.startTime) return "LIVE";
  if (drop.startTime && now < drop.startTime) return "SCHEDULED";

  return drop.status;
}

// ─── Public Queries ───────────────────────────────────

/**
 * Returns all drops visible to users (SCHEDULED, LIVE, or ENDED non-DRAFT).
 * Status is recomputed at read time.
 */
export async function findActiveDrops() {
  const drops = await prisma.drop.findMany({
    where: { status: { not: "DRAFT" } },
    include: {
      crates: {
        where: { isActive: true },
        select: {
          id: true, name: true, type: true, rarity: true,
          imageUrl: true, priceType: true, priceAmount: true,
          maxSupply: true, currentSupply: true, isActive: true,
        },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { startTime: "asc" }],
  });

  return drops.map((drop) => ({
    ...drop,
    status: computeDropStatus(drop),
  }));
}

/**
 * Returns a single drop with full details (crates + featured traits).
 */
export async function findDropById(id: string) {
  const drop = await prisma.drop.findUnique({
    where: { id },
    include: {
      crates: {
        where: { isActive: true },
        include: {
          rewards: { where: { isActive: true }, orderBy: { weight: "desc" } },
        },
      },
      dropTraits: {
        include: { traitDefinition: true },
      },
    },
  });

  if (!drop) return null;

  return {
    ...drop,
    status: computeDropStatus(drop),
    traitDefinitions: drop.dropTraits.map((dt) => dt.traitDefinition),
  };
}

/** Returns featured drops (for homepage banner). */
export async function findFeaturedDrops() {
  const drops = await prisma.drop.findMany({
    where: {
      isFeatured: true,
      status: { not: "DRAFT" },
    },
    include: {
      crates: {
        where: { isActive: true },
        select: { id: true, name: true, imageUrl: true },
      },
    },
    orderBy: { startTime: "asc" },
  });

  return drops
    .map((drop) => ({ ...drop, status: computeDropStatus(drop) }))
    .filter((d) => d.status === "LIVE" || d.status === "SCHEDULED");
}

// ─── Admin Operations ─────────────────────────────────

interface CreateDropInput {
  name: string;
  description?: string;
  bannerImage?: string;
  themeColor?: string;
  startTime?: Date;
  endTime?: Date;
  isFeatured?: boolean;
}

export async function createDrop(input: CreateDropInput) {
  const status: DropStatus = input.startTime ? "SCHEDULED" : "DRAFT";

  const drop = await prisma.drop.create({
    data: {
      name: input.name,
      description: input.description,
      bannerImage: input.bannerImage,
      themeColor: input.themeColor,
      startTime: input.startTime,
      endTime: input.endTime,
      isFeatured: input.isFeatured ?? false,
      status,
    },
  });

  economyEvents.emit("drop_created", {
    userId: "system",
    data: { dropId: drop.id, name: drop.name },
  });

  return drop;
}

interface UpdateDropInput {
  name?: string;
  description?: string;
  bannerImage?: string;
  themeColor?: string;
  startTime?: Date | null;
  endTime?: Date | null;
  isFeatured?: boolean;
  status?: DropStatus;
}

export async function updateDrop(id: string, input: UpdateDropInput) {
  const existing = await prisma.drop.findUnique({ where: { id } });
  if (!existing) throw new DropError("DROP_NOT_FOUND", "Drop not found");

  const drop = await prisma.drop.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.bannerImage !== undefined && { bannerImage: input.bannerImage }),
      ...(input.themeColor !== undefined && { themeColor: input.themeColor }),
      ...(input.startTime !== undefined && { startTime: input.startTime }),
      ...(input.endTime !== undefined && { endTime: input.endTime }),
      ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
      ...(input.status !== undefined && { status: input.status }),
    },
  });

  if (input.status === "LIVE" && existing.status !== "LIVE") {
    economyEvents.emit("drop_activated", {
      userId: "system",
      data: { dropId: drop.id, name: drop.name },
    });
  }

  return drop;
}

/** Assign crates to a drop. */
export async function assignCratesToDrop(dropId: string, crateDefinitionIds: string[]) {
  await prisma.crateDefinition.updateMany({
    where: { id: { in: crateDefinitionIds } },
    data: { dropId },
  });
}

/** Assign traits to a drop (many-to-many). */
export async function assignTraitsToDrop(dropId: string, traitDefinitionIds: string[]) {
  // Upsert: delete existing, re-create
  await prisma.dropTrait.deleteMany({ where: { dropId } });

  if (traitDefinitionIds.length > 0) {
    await prisma.dropTrait.createMany({
      data: traitDefinitionIds.map((traitDefinitionId) => ({
        dropId,
        traitDefinitionId,
      })),
    });
  }
}

/** Admin: list all drops including drafts. */
export async function findAllDrops() {
  const drops = await prisma.drop.findMany({
    include: {
      crates: { select: { id: true, name: true } },
      _count: { select: { dropTraits: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return drops.map((drop) => ({
    ...drop,
    status: computeDropStatus(drop),
  }));
}

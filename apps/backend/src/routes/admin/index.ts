import type { FastifyInstance } from "fastify";
import { resolveUser, requireAdmin } from "../../middleware/resolve-user.js";
import { logAudit, findAuditLogs } from "../../services/audit-service.js";
import {
  createDrop, updateDrop, findAllDrops, findDropById,
  assignCratesToDrop, assignTraitsToDrop, DropError,
} from "../../services/drop-service.js";
import { economyEvents } from "../../lib/economy-events.js";
import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";

export default async function adminRoutes(fastify: FastifyInstance) {
  // All admin routes require authentication + admin role
  fastify.addHook("preHandler", resolveUser);
  fastify.addHook("preHandler", requireAdmin);

  // ─── DROPS ───────────────────────────────────────────

  fastify.get("/drops", async () => {
    const drops = await findAllDrops();
    return { data: drops };
  });

  fastify.get("/drops/:id", async (request) => {
    const { id } = request.params as { id: string };
    const drop = await findDropById(id);
    if (!drop) return { error: "NOT_FOUND", message: "Drop not found" };
    return { data: drop };
  });

  fastify.post("/drops", async (request) => {
    const { userId } = request.resolvedUser!;
    const body = request.body as {
      name: string; description?: string; bannerImage?: string;
      themeColor?: string; startTime?: string; endTime?: string;
      isFeatured?: boolean;
    };

    const drop = await createDrop({
      name: body.name,
      description: body.description,
      bannerImage: body.bannerImage,
      themeColor: body.themeColor,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      isFeatured: body.isFeatured,
    });

    await logAudit({
      adminId: userId,
      action: "DROP_CREATED",
      targetType: "Drop",
      targetId: drop.id,
      after: { name: drop.name, status: drop.status },
    });

    return { data: drop };
  });

  fastify.put("/drops/:id", async (request) => {
    const { userId } = request.resolvedUser!;
    const { id } = request.params as { id: string };
    const body = request.body as {
      name?: string; description?: string; bannerImage?: string;
      themeColor?: string; startTime?: string | null; endTime?: string | null;
      isFeatured?: boolean; status?: string;
    };

    const before = await prisma.drop.findUnique({ where: { id } });

    const drop = await updateDrop(id, {
      ...body,
      startTime: body.startTime === null ? null : body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime === null ? null : body.endTime ? new Date(body.endTime) : undefined,
      status: body.status as "DRAFT" | "SCHEDULED" | "LIVE" | "ENDED" | undefined,
    });

    await logAudit({
      adminId: userId,
      action: "DROP_UPDATED",
      targetType: "Drop",
      targetId: id,
      before: before ? { name: before.name, status: before.status } : undefined,
      after: { name: drop.name, status: drop.status },
    });

    return { data: drop };
  });

  fastify.post("/drops/:id/crates", async (request) => {
    const { userId } = request.resolvedUser!;
    const { id } = request.params as { id: string };
    const { crateDefinitionIds } = request.body as { crateDefinitionIds: string[] };

    await assignCratesToDrop(id, crateDefinitionIds);

    await logAudit({
      adminId: userId,
      action: "DROP_CRATES_ASSIGNED",
      targetType: "Drop",
      targetId: id,
      after: { crateDefinitionIds },
    });

    return { data: { success: true } };
  });

  fastify.post("/drops/:id/traits", async (request) => {
    const { userId } = request.resolvedUser!;
    const { id } = request.params as { id: string };
    const { traitDefinitionIds } = request.body as { traitDefinitionIds: string[] };

    await assignTraitsToDrop(id, traitDefinitionIds);

    await logAudit({
      adminId: userId,
      action: "DROP_TRAITS_ASSIGNED",
      targetType: "Drop",
      targetId: id,
      after: { traitDefinitionIds },
    });

    return { data: { success: true } };
  });

  // ─── CRATE MANAGEMENT ───────────────────────────────

  fastify.get("/crates", async () => {
    const crates = await prisma.crateDefinition.findMany({
      include: {
        rewards: { orderBy: { weight: "desc" } },
        _count: { select: { userCrates: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { data: crates };
  });

  fastify.post("/crates", async (request) => {
    const { userId } = request.resolvedUser!;
    const body = request.body as {
      name: string; type?: string; rarity: string;
      description?: string; imageUrl: string;
      priceType?: string; priceAmount?: string;
      maxSupply?: number; isBase?: boolean; dropId?: string;
    };

    const crate = await prisma.crateDefinition.create({
      data: {
        name: body.name,
        type: (body.type ?? "STANDARD") as "STANDARD" | "PREMIUM" | "GENESIS" | "EVENT",
        rarity: body.rarity as "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY",
        description: body.description,
        imageUrl: body.imageUrl,
        priceType: (body.priceType ?? "PAWS") as "PAWS" | "ETH" | "USDT",
        priceAmount: body.priceAmount ?? "0",
        maxSupply: body.maxSupply,
        isBase: body.isBase ?? false,
        dropId: body.dropId,
      },
    });

    await logAudit({
      adminId: userId,
      action: "CRATE_CREATED",
      targetType: "CrateDefinition",
      targetId: crate.id,
      after: { name: crate.name, priceAmount: crate.priceAmount },
    });

    economyEvents.emit("crate_created", {
      userId,
      data: { crateId: crate.id, name: crate.name },
    });

    return { data: crate };
  });

  fastify.put("/crates/:id", async (request) => {
    const { userId } = request.resolvedUser!;
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const before = await prisma.crateDefinition.findUnique({ where: { id } });

    const crate = await prisma.crateDefinition.update({
      where: { id },
      data: body as Prisma.CrateDefinitionUpdateInput,
    });

    await logAudit({
      adminId: userId,
      action: "CRATE_UPDATED",
      targetType: "CrateDefinition",
      targetId: id,
      before: before ? { name: before.name, isActive: before.isActive } : undefined,
      after: { name: crate.name, isActive: crate.isActive },
    });

    return { data: crate };
  });

  // ─── CRATE REWARDS ──────────────────────────────────

  fastify.post("/crates/:id/rewards", async (request) => {
    const { userId } = request.resolvedUser!;
    const { id } = request.params as { id: string };
    const body = request.body as {
      rewardType: string; weight: number;
      traitDefinitionId?: string; traitRarity?: string;
      pawsAmount?: number; pawsMin?: number; pawsMax?: number;
      cubRarity?: string;
    };

    if (body.weight <= 0) {
      return { error: "INVALID_WEIGHT", message: "Weight must be positive" };
    }

    const reward = await prisma.crateReward.create({
      data: {
        crateDefinitionId: id,
        rewardType: body.rewardType as "TRAIT" | "PAWS" | "CUB" | "NFT",
        weight: body.weight,
        traitDefinitionId: body.traitDefinitionId,
        traitRarity: body.traitRarity as "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | undefined,
        pawsAmount: body.pawsAmount,
        pawsMin: body.pawsMin,
        pawsMax: body.pawsMax,
        cubRarity: body.cubRarity as "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | undefined,
      },
    });

    await logAudit({
      adminId: userId,
      action: "CRATE_REWARD_ADDED",
      targetType: "CrateReward",
      targetId: reward.id,
      after: { crateId: id, rewardType: body.rewardType, weight: body.weight },
    });

    return { data: reward };
  });

  fastify.delete("/crates/:crateId/rewards/:rewardId", async (request) => {
    const { userId } = request.resolvedUser!;
    const { rewardId } = request.params as { crateId: string; rewardId: string };

    await prisma.crateReward.delete({ where: { id: rewardId } });

    await logAudit({
      adminId: userId,
      action: "CRATE_REWARD_REMOVED",
      targetType: "CrateReward",
      targetId: rewardId,
    });

    return { data: { success: true } };
  });

  // ─── TRAIT MANAGEMENT ───────────────────────────────

  fastify.get("/traits", async (request) => {
    const query = request.query as { category?: string; rarity?: string };
    const where: Record<string, unknown> = {};
    if (query.category) where.category = query.category;
    if (query.rarity) where.rarity = query.rarity;

    const traits = await prisma.traitDefinition.findMany({
      where,
      orderBy: [{ category: "asc" }, { rarity: "asc" }, { name: "asc" }],
    });
    return { data: traits };
  });

  fastify.post("/traits", async (request) => {
    const { userId } = request.resolvedUser!;
    const body = request.body as {
      name: string; category: string; layer?: number;
      rarity: string; rarityWeight?: number;
      maxSupply: number; imageUrl: string;
      boostType?: string; boostValue?: number;
      isFullBody?: boolean;
    };

    const trait = await prisma.traitDefinition.create({
      data: {
        name: body.name,
        category: body.category as "BACKGROUND" | "BODY" | "OUTFIT" | "SHOES" | "ACCESSORIES" | "HAT" | "EYES" | "MOUTH" | "SPECIAL",
        layer: body.layer ?? 0,
        rarity: body.rarity as "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY",
        rarityWeight: body.rarityWeight ?? 0,
        maxSupply: body.maxSupply,
        imageUrl: body.imageUrl,
        boostType: (body.boostType ?? "NONE") as "NONE" | "PAWS_MULTIPLIER" | "PAWS_FLAT" | "LUCK",
        boostValue: body.boostValue ?? 0,
        isFullBody: body.isFullBody ?? false,
      },
    });

    await logAudit({
      adminId: userId,
      action: "TRAIT_CREATED",
      targetType: "TraitDefinition",
      targetId: trait.id,
      after: { name: trait.name, category: trait.category, rarity: trait.rarity },
    });

    economyEvents.emit("trait_created", {
      userId,
      data: { traitId: trait.id, name: trait.name },
    });

    return { data: trait };
  });

  fastify.put("/traits/:id", async (request) => {
    const { userId } = request.resolvedUser!;
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const before = await prisma.traitDefinition.findUnique({ where: { id } });

    const trait = await prisma.traitDefinition.update({
      where: { id },
      data: body as Prisma.TraitDefinitionUpdateInput,
    });

    await logAudit({
      adminId: userId,
      action: "TRAIT_UPDATED",
      targetType: "TraitDefinition",
      targetId: id,
      before: before ? { name: before.name, isActive: before.isActive } : undefined,
      after: { name: trait.name, isActive: trait.isActive },
    });

    return { data: trait };
  });

  // ─── ECONOMY CONFIG ─────────────────────────────────

  fastify.get("/economy", async () => {
    const config = await prisma.economyConfig.findUniqueOrThrow({ where: { id: 1 } });
    return { data: config };
  });

  fastify.put("/economy", async (request) => {
    const { userId } = request.resolvedUser!;
    const body = request.body as {
      basePawsRate?: number; rarityMultipliers?: Record<string, number>;
      marketplaceFeeBps?: number; marketplaceRoyaltyBps?: number;
      pawsTradeBurnPct?: number; traitBurnReturnMin?: number;
      traitBurnReturnMax?: number; dailyClaimAmount?: number;
      dailyClaimCooldownHrs?: number;
    };

    const before = await prisma.economyConfig.findUniqueOrThrow({ where: { id: 1 } });

    const config = await prisma.economyConfig.update({
      where: { id: 1 },
      data: {
        ...(body.basePawsRate !== undefined && { basePawsRate: body.basePawsRate }),
        ...(body.rarityMultipliers !== undefined && { rarityMultipliers: body.rarityMultipliers }),
        ...(body.marketplaceFeeBps !== undefined && { marketplaceFeeBps: body.marketplaceFeeBps }),
        ...(body.marketplaceRoyaltyBps !== undefined && { marketplaceRoyaltyBps: body.marketplaceRoyaltyBps }),
        ...(body.pawsTradeBurnPct !== undefined && { pawsTradeBurnPct: body.pawsTradeBurnPct }),
        ...(body.traitBurnReturnMin !== undefined && { traitBurnReturnMin: body.traitBurnReturnMin }),
        ...(body.traitBurnReturnMax !== undefined && { traitBurnReturnMax: body.traitBurnReturnMax }),
        ...(body.dailyClaimAmount !== undefined && { dailyClaimAmount: body.dailyClaimAmount }),
        ...(body.dailyClaimCooldownHrs !== undefined && { dailyClaimCooldownHrs: body.dailyClaimCooldownHrs }),
        version: { increment: 1 },
        updatedBy: userId,
      },
    });

    await logAudit({
      adminId: userId,
      action: "ECONOMY_CONFIG_UPDATED",
      targetType: "EconomyConfig",
      targetId: "1",
      before: {
        basePawsRate: before.basePawsRate,
        version: before.version,
      },
      after: {
        basePawsRate: config.basePawsRate,
        version: config.version,
      },
    });

    economyEvents.emit("economy_updated", {
      userId,
      data: { version: config.version },
    });

    return { data: config };
  });

  // ─── ANALYTICS ──────────────────────────────────────

  fastify.get("/analytics/stats", async () => {
    const [pawsData, cratesOpened, traitsMinted, activeUsers, totalCubs] = await Promise.all([
      prisma.economyStatsDaily.aggregate({
        _sum: { totalPawsEarned: true, totalPawsSpent: true },
      }),
      prisma.economyStatsDaily.aggregate({ _sum: { cratesOpened: true } }),
      prisma.economyStatsDaily.aggregate({ _sum: { traitsMinted: true } }),
      prisma.user.count({ where: { updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.cub.count(),
    ]);

    return {
      data: {
        totalPawsEarned: pawsData._sum.totalPawsEarned ?? 0,
        totalPawsSpent: pawsData._sum.totalPawsSpent ?? 0,
        cratesOpened: cratesOpened._sum.cratesOpened ?? 0,
        traitsMinted: traitsMinted._sum.traitsMinted ?? 0,
        activeUsers,
        totalCubs,
      },
    };
  });

  fastify.get("/analytics/daily", async (request) => {
    const { days } = request.query as { days?: string };
    const limit = Math.min(parseInt(days ?? "30", 10), 90);

    const stats = await prisma.economyStatsDaily.findMany({
      orderBy: { date: "desc" },
      take: limit,
    });

    return { data: stats.reverse() };
  });

  // ─── AUDIT LOGS ─────────────────────────────────────

  fastify.get("/audit-logs", async (request) => {
    const query = request.query as {
      targetType?: string; page?: string; limit?: string;
    };

    const result = await findAuditLogs({
      targetType: query.targetType,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    });

    return { data: result };
  });
}

import { prisma } from "../lib/prisma.js";

interface AuditEntry {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string | null;
}

export async function logAudit(entry: AuditEntry) {
  const changes: { before?: Record<string, unknown>; after?: Record<string, unknown> } = {};
  if (entry.before) changes.before = entry.before;
  if (entry.after) changes.after = entry.after;

  await prisma.auditLog.create({
    data: {
      adminId: entry.adminId,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      changes: changes as object,
      ipAddress: entry.ipAddress ?? null,
    },
  });
}

export async function findAuditLogs(opts: {
  adminId?: string;
  targetType?: string;
  targetId?: string;
  page?: number;
  limit?: number;
}) {
  const page = opts.page ?? 1;
  const limit = Math.min(opts.limit ?? 50, 100);

  const where: Record<string, unknown> = {};
  if (opts.adminId) where.adminId = opts.adminId;
  if (opts.targetType) where.targetType = opts.targetType;
  if (opts.targetId) where.targetId = opts.targetId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { admin: { select: { walletAddress: true, displayName: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, limit };
}

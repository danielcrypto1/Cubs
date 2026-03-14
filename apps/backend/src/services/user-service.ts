import { prisma } from "../lib/prisma.js";

export async function findUserByAddress(walletAddress: string) {
  return prisma.user.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
  });
}

export async function upsertUser(walletAddress: string) {
  return prisma.user.upsert({
    where: { walletAddress: walletAddress.toLowerCase() },
    update: { updatedAt: new Date() },
    create: { walletAddress: walletAddress.toLowerCase() },
  });
}

export async function updateUserProfile(
  walletAddress: string,
  data: { displayName?: string; avatarUrl?: string }
) {
  return prisma.user.update({
    where: { walletAddress: walletAddress.toLowerCase() },
    data,
  });
}

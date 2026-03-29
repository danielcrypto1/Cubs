import { prisma } from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";

export async function findUserTraits(walletAddress: string) {
  return prisma.userTrait.findMany({
    where: { walletAddress: walletAddress.toLowerCase() },
    include: { traitDefinition: true },
    orderBy: [{ traitDefinition: { category: "asc" } }, { traitDefinition: { name: "asc" } }],
  });
}

export async function validateTraitOwnership(
  walletAddress: string,
  traitDefinitionId: string,
  client: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<boolean> {
  const userTrait = await client.userTrait.findUnique({
    where: {
      walletAddress_traitDefinitionId: {
        walletAddress: walletAddress.toLowerCase(),
        traitDefinitionId,
      },
    },
  });
  return userTrait !== null && userTrait.quantity > 0;
}

export async function decrementUserTrait(
  walletAddress: string,
  traitDefinitionId: string,
  client: Prisma.TransactionClient | typeof prisma = prisma,
) {
  const addr = walletAddress.toLowerCase();
  const userTrait = await client.userTrait.findUnique({
    where: {
      walletAddress_traitDefinitionId: {
        walletAddress: addr,
        traitDefinitionId,
      },
    },
  });

  if (!userTrait || userTrait.quantity <= 0) {
    throw new Error(`User does not own trait ${traitDefinitionId}`);
  }

  if (userTrait.quantity === 1) {
    return client.userTrait.delete({
      where: { id: userTrait.id },
    });
  }

  return client.userTrait.update({
    where: { id: userTrait.id },
    data: { quantity: { decrement: 1 } },
  });
}

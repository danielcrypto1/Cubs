import { prisma } from "../lib/prisma.js";
import { selectReward } from "./loot-engine.js";

export async function findUserCrates(walletAddress: string) {
  return prisma.userCrate.findMany({
    where: { walletAddress: walletAddress.toLowerCase() },
    include: { crateDefinition: true },
    orderBy: { crateDefinition: { rarity: "asc" } },
  });
}

export async function findAllCrateDefinitions() {
  return prisma.crateDefinition.findMany({
    orderBy: { rarity: "asc" },
  });
}

export async function getLootTable(crateDefinitionId: string) {
  return prisma.lootTableEntry.findMany({
    where: { crateDefinitionId },
    orderBy: { probability: "desc" },
  });
}

export async function openCrate(walletAddress: string, crateDefinitionId: string) {
  const address = walletAddress.toLowerCase();

  // Select reward BEFORE transaction (reads only, retry-safe)
  const reward = await selectReward(crateDefinitionId);

  return prisma.$transaction(async (tx) => {
    // 1. Verify crate ownership
    const userCrate = await tx.userCrate.findUnique({
      where: {
        walletAddress_crateDefinitionId: {
          walletAddress: address,
          crateDefinitionId,
        },
      },
    });

    if (!userCrate || userCrate.quantity <= 0) {
      throw new Error("You do not own this crate");
    }

    // 2. Check supply and increment
    const traitDef = await tx.traitDefinition.findUniqueOrThrow({
      where: { id: reward.traitDefinitionId },
    });

    if (traitDef.currentSupply >= traitDef.maxSupply) {
      throw new Error("Trait supply exhausted, please try again");
    }

    await tx.traitDefinition.update({
      where: { id: reward.traitDefinitionId },
      data: { currentSupply: { increment: 1 } },
    });

    // 3. Add trait to user inventory
    await tx.userTrait.upsert({
      where: {
        walletAddress_traitDefinitionId: {
          walletAddress: address,
          traitDefinitionId: reward.traitDefinitionId,
        },
      },
      update: { quantity: { increment: 1 } },
      create: {
        walletAddress: address,
        traitDefinitionId: reward.traitDefinitionId,
        quantity: 1,
        acquiredFrom: "CRATE",
      },
    });

    // 4. Decrement/delete user crate
    let remainingCrates: number;
    if (userCrate.quantity === 1) {
      await tx.userCrate.delete({ where: { id: userCrate.id } });
      remainingCrates = 0;
    } else {
      const updated = await tx.userCrate.update({
        where: { id: userCrate.id },
        data: { quantity: { decrement: 1 } },
      });
      remainingCrates = updated.quantity;
    }

    return {
      success: true,
      reward: {
        traitDefinition: { ...traitDef, currentSupply: traitDef.currentSupply + 1 },
        rarity: reward.traitRarity,
      },
      remainingCrates,
    };
  });
}

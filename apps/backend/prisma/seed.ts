import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const user1 = await prisma.user.upsert({
    where: { walletAddress: "0x1234567890abcdef1234567890abcdef12345678" },
    update: {},
    create: {
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      displayName: "Test User",
      role: "USER",
    },
  });

  const admin = await prisma.user.upsert({
    where: { walletAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" },
    update: {},
    create: {
      walletAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      displayName: "Admin",
      role: "ADMIN",
    },
  });

  // Create test cubs
  const cub1 = await prisma.cub.upsert({
    where: { tokenId: 1 },
    update: {},
    create: {
      tokenId: 1,
      name: "Genesis Cub",
      description: "The first cub ever minted",
      imageUrl: "https://placehold.co/400x400/1a1a2e/e0e0e0?text=Cub+%231",
      ownerId: user1.id,
    },
  });

  const cub2 = await prisma.cub.upsert({
    where: { tokenId: 2 },
    update: {},
    create: {
      tokenId: 2,
      name: "Shadow Cub",
      description: "A mysterious dark cub",
      imageUrl: "https://placehold.co/400x400/2d1b69/e0e0e0?text=Cub+%232",
      ownerId: user1.id,
    },
  });

  const cub3 = await prisma.cub.upsert({
    where: { tokenId: 3 },
    update: {},
    create: {
      tokenId: 3,
      name: "Golden Cub",
      description: "A rare golden cub",
      imageUrl: "https://placehold.co/400x400/6b4c00/e0e0e0?text=Cub+%233",
      ownerId: admin.id,
    },
  });

  // Create traits
  const traitData = [
    { cubId: cub1.id, traitType: "Background", traitValue: "Midnight Blue", displayOrder: 0 },
    { cubId: cub1.id, traitType: "Fur", traitValue: "Brown", displayOrder: 1 },
    { cubId: cub1.id, traitType: "Eyes", traitValue: "Green", displayOrder: 2 },
    { cubId: cub1.id, traitType: "Accessory", traitValue: "Crown", displayOrder: 3 },
    { cubId: cub2.id, traitType: "Background", traitValue: "Deep Purple", displayOrder: 0 },
    { cubId: cub2.id, traitType: "Fur", traitValue: "Black", displayOrder: 1 },
    { cubId: cub2.id, traitType: "Eyes", traitValue: "Red", displayOrder: 2 },
    { cubId: cub2.id, traitType: "Accessory", traitValue: "Mask", displayOrder: 3 },
    { cubId: cub3.id, traitType: "Background", traitValue: "Sunset", displayOrder: 0 },
    { cubId: cub3.id, traitType: "Fur", traitValue: "Golden", displayOrder: 1 },
    { cubId: cub3.id, traitType: "Eyes", traitValue: "Blue", displayOrder: 2 },
    { cubId: cub3.id, traitType: "Accessory", traitValue: "Chain", displayOrder: 3 },
  ];

  for (const trait of traitData) {
    await prisma.trait.upsert({
      where: { cubId_traitType: { cubId: trait.cubId, traitType: trait.traitType } },
      update: { traitValue: trait.traitValue },
      create: trait,
    });
  }

  console.log("Seed complete: 2 users, 3 cubs, 12 traits");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

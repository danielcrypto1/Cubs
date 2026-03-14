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

  // Phase 2: Trait Definitions (registry of all possible traits)
  const traitDefinitions = [
    // Backgrounds
    { name: "Midnight Blue", category: "BACKGROUND" as const, rarity: "COMMON" as const, maxSupply: 1000, imageUrl: "https://placehold.co/1024x1024/1a1a2e/1a1a2e" },
    { name: "Deep Purple", category: "BACKGROUND" as const, rarity: "COMMON" as const, maxSupply: 1000, imageUrl: "https://placehold.co/1024x1024/2d1b69/2d1b69" },
    { name: "Sunset Orange", category: "BACKGROUND" as const, rarity: "UNCOMMON" as const, maxSupply: 500, imageUrl: "https://placehold.co/1024x1024/ff6b35/ff6b35" },
    { name: "Cosmic Nebula", category: "BACKGROUND" as const, rarity: "RARE" as const, maxSupply: 200, imageUrl: "https://placehold.co/1024x1024/0d0221/0d0221" },
    // Bodies
    { name: "Classic Brown", category: "BODY" as const, rarity: "COMMON" as const, maxSupply: 1000, imageUrl: "https://placehold.co/1024x1024/8B4513/8B4513" },
    { name: "Midnight Black", category: "BODY" as const, rarity: "COMMON" as const, maxSupply: 1000, imageUrl: "https://placehold.co/1024x1024/1a1a1a/1a1a1a" },
    { name: "Arctic White", category: "BODY" as const, rarity: "UNCOMMON" as const, maxSupply: 500, imageUrl: "https://placehold.co/1024x1024/f0f0f0/f0f0f0" },
    { name: "Golden", category: "BODY" as const, rarity: "LEGENDARY" as const, maxSupply: 50, imageUrl: "https://placehold.co/1024x1024/FFD700/FFD700" },
    // Outfits
    { name: "Hoodie", category: "OUTFIT" as const, rarity: "COMMON" as const, maxSupply: 800, imageUrl: "https://placehold.co/1024x1024/4a4a4a/e0e0e0?text=Hoodie" },
    { name: "Leather Jacket", category: "OUTFIT" as const, rarity: "UNCOMMON" as const, maxSupply: 400, imageUrl: "https://placehold.co/1024x1024/3d2b1f/e0e0e0?text=Leather" },
    { name: "Space Suit", category: "OUTFIT" as const, rarity: "EPIC" as const, maxSupply: 100, imageUrl: "https://placehold.co/1024x1024/c0c0c0/333?text=SpaceSuit" },
    // Hats
    { name: "Baseball Cap", category: "HAT" as const, rarity: "COMMON" as const, maxSupply: 800, imageUrl: "https://placehold.co/1024x1024/cc0000/fff?text=Cap" },
    { name: "Crown", category: "HAT" as const, rarity: "EPIC" as const, maxSupply: 100, imageUrl: "https://placehold.co/1024x1024/FFD700/333?text=Crown" },
    { name: "Wizard Hat", category: "HAT" as const, rarity: "RARE" as const, maxSupply: 200, imageUrl: "https://placehold.co/1024x1024/4B0082/fff?text=Wizard" },
    // Eyes
    { name: "Green Eyes", category: "EYES" as const, rarity: "COMMON" as const, maxSupply: 800, imageUrl: "https://placehold.co/1024x1024/00ff00/00ff00" },
    { name: "Red Eyes", category: "EYES" as const, rarity: "UNCOMMON" as const, maxSupply: 400, imageUrl: "https://placehold.co/1024x1024/ff0000/ff0000" },
    { name: "Laser Eyes", category: "EYES" as const, rarity: "LEGENDARY" as const, maxSupply: 25, imageUrl: "https://placehold.co/1024x1024/ff0000/ffff00?text=LASER" },
    // Mouth
    { name: "Smile", category: "MOUTH" as const, rarity: "COMMON" as const, maxSupply: 800, imageUrl: "https://placehold.co/1024x1024/ff9999/ff9999" },
    { name: "Cigar", category: "MOUTH" as const, rarity: "RARE" as const, maxSupply: 200, imageUrl: "https://placehold.co/1024x1024/8B4513/e0e0e0?text=Cigar" },
    // Accessories
    { name: "Gold Chain", category: "ACCESSORIES" as const, rarity: "UNCOMMON" as const, maxSupply: 400, imageUrl: "https://placehold.co/1024x1024/FFD700/e0e0e0?text=Chain" },
    { name: "Diamond Pendant", category: "ACCESSORIES" as const, rarity: "EPIC" as const, maxSupply: 100, imageUrl: "https://placehold.co/1024x1024/b9f2ff/333?text=Diamond" },
    // Shoes
    { name: "Sneakers", category: "SHOES" as const, rarity: "COMMON" as const, maxSupply: 800, imageUrl: "https://placehold.co/1024x1024/ffffff/333?text=Sneakers" },
    { name: "Boots", category: "SHOES" as const, rarity: "UNCOMMON" as const, maxSupply: 400, imageUrl: "https://placehold.co/1024x1024/3d2b1f/e0e0e0?text=Boots" },
    // Special
    { name: "Rainbow Aura", category: "SPECIAL" as const, rarity: "LEGENDARY" as const, maxSupply: 10, imageUrl: "https://placehold.co/1024x1024/ff00ff/00ffff?text=RAINBOW" },
    { name: "Fire Effect", category: "SPECIAL" as const, rarity: "EPIC" as const, maxSupply: 75, imageUrl: "https://placehold.co/1024x1024/ff4500/ffff00?text=FIRE" },
  ];

  for (const def of traitDefinitions) {
    await prisma.traitDefinition.upsert({
      where: { name_category: { name: def.name, category: def.category } },
      update: { rarity: def.rarity, maxSupply: def.maxSupply, imageUrl: def.imageUrl },
      create: def,
    });
  }

  // Give test user some traits in their inventory
  const allDefs = await prisma.traitDefinition.findMany();
  const testWallet = "0x1234567890abcdef1234567890abcdef12345678";

  for (const def of allDefs.slice(0, 15)) {
    await prisma.userTrait.upsert({
      where: {
        walletAddress_traitDefinitionId: {
          walletAddress: testWallet,
          traitDefinitionId: def.id,
        },
      },
      update: { quantity: 2 },
      create: {
        walletAddress: testWallet,
        traitDefinitionId: def.id,
        quantity: 2,
        acquiredFrom: "MINT",
      },
    });
  }

  console.log("Seed complete: 2 users, 3 cubs, 12 traits, 25 trait definitions, 15 user traits");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

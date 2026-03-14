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

  // Phase 3: Crate Definitions
  const crateDefinitions = [
    { name: "Common Crate", rarity: "COMMON" as const, description: "A basic crate with common loot", imageUrl: "https://placehold.co/400x400/6b7280/fff?text=Common+Crate" },
    { name: "Rare Crate", rarity: "RARE" as const, description: "A shimmering crate with better odds", imageUrl: "https://placehold.co/400x400/3b82f6/fff?text=Rare+Crate" },
    { name: "Epic Crate", rarity: "EPIC" as const, description: "A glowing crate with epic potential", imageUrl: "https://placehold.co/400x400/9333ea/fff?text=Epic+Crate" },
    { name: "Legendary Crate", rarity: "LEGENDARY" as const, description: "An ancient crate of immense power", imageUrl: "https://placehold.co/400x400/f59e0b/fff?text=Legendary+Crate" },
  ];

  for (const def of crateDefinitions) {
    await prisma.crateDefinition.upsert({
      where: { name: def.name },
      update: { rarity: def.rarity, description: def.description, imageUrl: def.imageUrl },
      create: def,
    });
  }

  // Loot table entries
  const allCrateDefs = await prisma.crateDefinition.findMany();
  const lootConfig: Record<string, Record<string, number>> = {
    "Common Crate": { COMMON: 0.60, UNCOMMON: 0.25, RARE: 0.10, EPIC: 0.04, LEGENDARY: 0.01 },
    "Rare Crate": { COMMON: 0.30, UNCOMMON: 0.35, RARE: 0.20, EPIC: 0.10, LEGENDARY: 0.05 },
    "Epic Crate": { COMMON: 0.10, UNCOMMON: 0.20, RARE: 0.30, EPIC: 0.25, LEGENDARY: 0.15 },
    "Legendary Crate": { COMMON: 0.05, UNCOMMON: 0.10, RARE: 0.20, EPIC: 0.30, LEGENDARY: 0.35 },
  };

  for (const crateDef of allCrateDefs) {
    const config = lootConfig[crateDef.name];
    if (!config) continue;
    for (const [rarity, probability] of Object.entries(config)) {
      await prisma.lootTableEntry.upsert({
        where: {
          crateDefinitionId_traitRarity: {
            crateDefinitionId: crateDef.id,
            traitRarity: rarity as "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY",
          },
        },
        update: { probability },
        create: {
          crateDefinitionId: crateDef.id,
          traitRarity: rarity as "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY",
          probability,
        },
      });
    }
  }

  // Give test user some crates
  for (const crateDef of allCrateDefs) {
    await prisma.userCrate.upsert({
      where: {
        walletAddress_crateDefinitionId: {
          walletAddress: testWallet,
          crateDefinitionId: crateDef.id,
        },
      },
      update: { quantity: 5 },
      create: {
        walletAddress: testWallet,
        crateDefinitionId: crateDef.id,
        quantity: 5,
      },
    });
  }

  console.log("Seed complete: 2 users, 3 cubs, 12 traits, 25 trait definitions, 15 user traits, 4 crate definitions, 20 loot entries, 4 user crates");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

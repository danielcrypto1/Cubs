import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── Users ──────────────────────────────────────────────

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

  // ─── Cubs ───────────────────────────────────────────────

  const cub1 = await prisma.cub.upsert({
    where: { tokenId: 1 },
    update: {},
    create: {
      tokenId: 1,
      name: "Genesis Cub",
      description: "The first cub ever minted",
      rarity: "RARE",
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
      rarity: "EPIC",
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
      rarity: "LEGENDARY",
      imageUrl: "https://placehold.co/400x400/6b4c00/e0e0e0?text=Cub+%233",
      ownerId: admin.id,
    },
  });

  // ─── Traits (equipped on cubs) ──────────────────────────

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

  // ─── Trait Definitions ──────────────────────────────────

  const traitDefinitions = [
    // Backgrounds (layer 0)
    { name: "Midnight Blue", category: "BACKGROUND" as const, layer: 0, rarity: "COMMON" as const, rarityWeight: 0.35, maxSupply: 1000, imageUrl: "https://placehold.co/1024x1024/1a1a2e/1a1a2e", boostType: "NONE" as const, boostValue: 0 },
    { name: "Deep Purple", category: "BACKGROUND" as const, layer: 0, rarity: "COMMON" as const, rarityWeight: 0.35, maxSupply: 1000, imageUrl: "https://placehold.co/1024x1024/2d1b69/2d1b69", boostType: "NONE" as const, boostValue: 0 },
    { name: "Sunset Orange", category: "BACKGROUND" as const, layer: 0, rarity: "UNCOMMON" as const, rarityWeight: 0.20, maxSupply: 500, imageUrl: "https://placehold.co/1024x1024/ff6b35/ff6b35", boostType: "NONE" as const, boostValue: 0 },
    { name: "Cosmic Nebula", category: "BACKGROUND" as const, layer: 0, rarity: "RARE" as const, rarityWeight: 0.10, maxSupply: 200, imageUrl: "https://placehold.co/1024x1024/0d0221/0d0221", boostType: "PAWS_FLAT" as const, boostValue: 5 },
    // Bodies (layer 1)
    { name: "Classic Brown", category: "BODY" as const, layer: 1, rarity: "COMMON" as const, rarityWeight: 0.35, maxSupply: 1000, imageUrl: "https://placehold.co/1024x1024/8B4513/8B4513", boostType: "NONE" as const, boostValue: 0 },
    { name: "Midnight Black", category: "BODY" as const, layer: 1, rarity: "COMMON" as const, rarityWeight: 0.35, maxSupply: 1000, imageUrl: "https://placehold.co/1024x1024/1a1a1a/1a1a1a", boostType: "NONE" as const, boostValue: 0 },
    { name: "Arctic White", category: "BODY" as const, layer: 1, rarity: "UNCOMMON" as const, rarityWeight: 0.20, maxSupply: 500, imageUrl: "https://placehold.co/1024x1024/f0f0f0/f0f0f0", boostType: "PAWS_FLAT" as const, boostValue: 10 },
    { name: "Golden", category: "BODY" as const, layer: 1, rarity: "LEGENDARY" as const, rarityWeight: 0.01, maxSupply: 50, imageUrl: "https://placehold.co/1024x1024/FFD700/FFD700", boostType: "PAWS_MULTIPLIER" as const, boostValue: 1.5 },
    // Outfits (layer 2)
    { name: "Hoodie", category: "OUTFIT" as const, layer: 2, rarity: "COMMON" as const, rarityWeight: 0.35, maxSupply: 800, imageUrl: "https://placehold.co/1024x1024/4a4a4a/e0e0e0?text=Hoodie", boostType: "NONE" as const, boostValue: 0 },
    { name: "Leather Jacket", category: "OUTFIT" as const, layer: 2, rarity: "UNCOMMON" as const, rarityWeight: 0.20, maxSupply: 400, imageUrl: "https://placehold.co/1024x1024/3d2b1f/e0e0e0?text=Leather", boostType: "PAWS_FLAT" as const, boostValue: 15 },
    { name: "Space Suit", category: "OUTFIT" as const, layer: 2, rarity: "EPIC" as const, rarityWeight: 0.05, maxSupply: 100, imageUrl: "https://placehold.co/1024x1024/c0c0c0/333?text=SpaceSuit", boostType: "PAWS_MULTIPLIER" as const, boostValue: 1.2 },
    // Hats (layer 6)
    { name: "Baseball Cap", category: "HAT" as const, layer: 6, rarity: "COMMON" as const, rarityWeight: 0.35, maxSupply: 800, imageUrl: "https://placehold.co/1024x1024/cc0000/fff?text=Cap", boostType: "NONE" as const, boostValue: 0 },
    { name: "Crown", category: "HAT" as const, layer: 6, rarity: "EPIC" as const, rarityWeight: 0.05, maxSupply: 100, imageUrl: "https://placehold.co/1024x1024/FFD700/333?text=Crown", boostType: "PAWS_MULTIPLIER" as const, boostValue: 1.3 },
    { name: "Wizard Hat", category: "HAT" as const, layer: 6, rarity: "RARE" as const, rarityWeight: 0.10, maxSupply: 200, imageUrl: "https://placehold.co/1024x1024/4B0082/fff?text=Wizard", boostType: "LUCK" as const, boostValue: 0.05 },
    // Eyes (layer 7)
    { name: "Green Eyes", category: "EYES" as const, layer: 7, rarity: "COMMON" as const, rarityWeight: 0.35, maxSupply: 800, imageUrl: "https://placehold.co/1024x1024/00ff00/00ff00", boostType: "NONE" as const, boostValue: 0 },
    { name: "Red Eyes", category: "EYES" as const, layer: 7, rarity: "UNCOMMON" as const, rarityWeight: 0.20, maxSupply: 400, imageUrl: "https://placehold.co/1024x1024/ff0000/ff0000", boostType: "PAWS_FLAT" as const, boostValue: 8 },
    { name: "Laser Eyes", category: "EYES" as const, layer: 7, rarity: "LEGENDARY" as const, rarityWeight: 0.01, maxSupply: 25, imageUrl: "https://placehold.co/1024x1024/ff0000/ffff00?text=LASER", boostType: "PAWS_MULTIPLIER" as const, boostValue: 2.0 },
    // Mouth (layer 8)
    { name: "Smile", category: "MOUTH" as const, layer: 8, rarity: "COMMON" as const, rarityWeight: 0.35, maxSupply: 800, imageUrl: "https://placehold.co/1024x1024/ff9999/ff9999", boostType: "NONE" as const, boostValue: 0 },
    { name: "Cigar", category: "MOUTH" as const, layer: 8, rarity: "RARE" as const, rarityWeight: 0.10, maxSupply: 200, imageUrl: "https://placehold.co/1024x1024/8B4513/e0e0e0?text=Cigar", boostType: "PAWS_FLAT" as const, boostValue: 12 },
    // Accessories (layer 5)
    { name: "Gold Chain", category: "ACCESSORIES" as const, layer: 5, rarity: "UNCOMMON" as const, rarityWeight: 0.20, maxSupply: 400, imageUrl: "https://placehold.co/1024x1024/FFD700/e0e0e0?text=Chain", boostType: "PAWS_FLAT" as const, boostValue: 10 },
    { name: "Diamond Pendant", category: "ACCESSORIES" as const, layer: 5, rarity: "EPIC" as const, rarityWeight: 0.05, maxSupply: 100, imageUrl: "https://placehold.co/1024x1024/b9f2ff/333?text=Diamond", boostType: "PAWS_MULTIPLIER" as const, boostValue: 1.25 },
    // Shoes (layer 3)
    { name: "Sneakers", category: "SHOES" as const, layer: 3, rarity: "COMMON" as const, rarityWeight: 0.35, maxSupply: 800, imageUrl: "https://placehold.co/1024x1024/ffffff/333?text=Sneakers", boostType: "NONE" as const, boostValue: 0 },
    { name: "Boots", category: "SHOES" as const, layer: 3, rarity: "UNCOMMON" as const, rarityWeight: 0.20, maxSupply: 400, imageUrl: "https://placehold.co/1024x1024/3d2b1f/e0e0e0?text=Boots", boostType: "PAWS_FLAT" as const, boostValue: 5 },
    // Special (layer 9)
    { name: "Rainbow Aura", category: "SPECIAL" as const, layer: 9, rarity: "LEGENDARY" as const, rarityWeight: 0.01, maxSupply: 10, imageUrl: "https://placehold.co/1024x1024/ff00ff/00ffff?text=RAINBOW", boostType: "PAWS_MULTIPLIER" as const, boostValue: 3.0 },
    { name: "Fire Effect", category: "SPECIAL" as const, layer: 9, rarity: "EPIC" as const, rarityWeight: 0.05, maxSupply: 75, imageUrl: "https://placehold.co/1024x1024/ff4500/ffff00?text=FIRE", boostType: "PAWS_MULTIPLIER" as const, boostValue: 1.5 },
  ];

  for (const def of traitDefinitions) {
    await prisma.traitDefinition.upsert({
      where: { name_category: { name: def.name, category: def.category } },
      update: { rarity: def.rarity, maxSupply: def.maxSupply, imageUrl: def.imageUrl, layer: def.layer, rarityWeight: def.rarityWeight, boostType: def.boostType, boostValue: def.boostValue },
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

  // ─── Crate Definitions (with pricing) ───────────────────

  const crateDefinitions = [
    { name: "Common Crate", type: "STANDARD" as const, rarity: "COMMON" as const, description: "A basic crate with common loot", imageUrl: "https://placehold.co/400x400/6b7280/fff?text=Common+Crate", priceType: "PAWS" as const, priceAmount: "200", maxSupply: null as number | null },
    { name: "Rare Crate", type: "STANDARD" as const, rarity: "RARE" as const, description: "A shimmering crate with better odds", imageUrl: "https://placehold.co/400x400/3b82f6/fff?text=Rare+Crate", priceType: "PAWS" as const, priceAmount: "500" },
    { name: "Epic Crate", type: "PREMIUM" as const, rarity: "EPIC" as const, description: "A glowing crate with epic potential", imageUrl: "https://placehold.co/400x400/9333ea/fff?text=Epic+Crate", priceType: "PAWS" as const, priceAmount: "1200" },
    { name: "Legendary Crate", type: "PREMIUM" as const, rarity: "LEGENDARY" as const, description: "An ancient crate of immense power", imageUrl: "https://placehold.co/400x400/f59e0b/fff?text=Legendary+Crate", priceType: "ETH" as const, priceAmount: "10000000000000000" },
    { name: "Genesis Crate", type: "GENESIS" as const, rarity: "LEGENDARY" as const, description: "Earned by burning a Bud Bear", imageUrl: "https://placehold.co/400x400/dc2626/fff?text=Genesis+Crate", priceType: "ETH" as const, priceAmount: "0", maxSupply: 500 },
  ];

  for (const def of crateDefinitions) {
    await prisma.crateDefinition.upsert({
      where: { name: def.name },
      update: { rarity: def.rarity, description: def.description, imageUrl: def.imageUrl, type: def.type, priceType: def.priceType, priceAmount: def.priceAmount },
      create: def,
    });
  }

  // Loot table entries
  const allCrateDefs = await prisma.crateDefinition.findMany();
  const lootConfig: Record<string, Record<string, number>> = {
    "Common Crate": { COMMON: 60, UNCOMMON: 25, RARE: 10, EPIC: 4, LEGENDARY: 1 },
    "Rare Crate": { COMMON: 30, UNCOMMON: 35, RARE: 20, EPIC: 10, LEGENDARY: 5 },
    "Epic Crate": { COMMON: 10, UNCOMMON: 20, RARE: 30, EPIC: 25, LEGENDARY: 15 },
    "Legendary Crate": { COMMON: 5, UNCOMMON: 10, RARE: 20, EPIC: 30, LEGENDARY: 35 },
    "Genesis Crate": { COMMON: 0, UNCOMMON: 5, RARE: 25, EPIC: 35, LEGENDARY: 35 },
  };

  for (const crateDef of allCrateDefs) {
    const cfg = lootConfig[crateDef.name];
    if (!cfg) continue;
    for (const [rarity, weight] of Object.entries(cfg)) {
      if (weight === 0) continue;
      // Delete old entries first to avoid unique constraint issues on re-seed
      await prisma.lootTableEntry.deleteMany({
        where: { crateDefinitionId: crateDef.id, traitRarity: rarity as "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" },
      });
      await prisma.lootTableEntry.create({
        data: {
          crateDefinitionId: crateDef.id,
          traitRarity: rarity as "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY",
          probability: weight,
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

  // ─── Marketplace Listings ───────────────────────────────

  // List cub3 (owned by admin) for sale with ETH
  await prisma.marketplaceListing.upsert({
    where: { id: "seed-listing-cub-1" },
    update: {},
    create: {
      id: "seed-listing-cub-1",
      assetType: "CUB",
      cubId: cub3.id,
      sellerId: admin.id,
      priceType: "ETH",
      priceAmount: "50000000000000000", // 0.05 ETH
      quantity: 1,
    },
  });

  // List some traits from test user (PAWS pricing)
  const traitDefsForListing = allDefs.slice(0, 3);
  for (let i = 0; i < traitDefsForListing.length; i++) {
    const def = traitDefsForListing[i];
    await prisma.marketplaceListing.upsert({
      where: { id: `seed-listing-trait-${i}` },
      update: {},
      create: {
        id: `seed-listing-trait-${i}`,
        assetType: "TRAIT",
        traitDefinitionId: def.id,
        sellerId: user1.id,
        priceType: "PAWS",
        priceAmount: `${(i + 1) * 100}`,
        quantity: 1,
      },
    });
  }

  // List a crate from test user
  const firstCrateDef = allCrateDefs[0];
  await prisma.marketplaceListing.upsert({
    where: { id: "seed-listing-crate-1" },
    update: {},
    create: {
      id: "seed-listing-crate-1",
      assetType: "CRATE",
      crateDefinitionId: firstCrateDef.id,
      sellerId: user1.id,
      priceType: "PAWS",
      priceAmount: "150",
      quantity: 2,
    },
  });

  // ─── Cub Equipped Traits (new composition system) ────────

  // Map old trait values to TraitDefinition names for equipping
  const equipMap: Record<string, Record<string, string>> = {
    [cub1.id]: { BACKGROUND: "Midnight Blue", BODY: "Classic Brown", EYES: "Green Eyes", HAT: "Crown" },
    [cub2.id]: { BACKGROUND: "Deep Purple", BODY: "Midnight Black", EYES: "Red Eyes", ACCESSORIES: "Gold Chain" },
    [cub3.id]: { BACKGROUND: "Sunset Orange", BODY: "Golden", EYES: "Laser Eyes", ACCESSORIES: "Diamond Pendant" },
  };

  for (const [cubId, slots] of Object.entries(equipMap)) {
    for (const [category, traitName] of Object.entries(slots)) {
      const def = allDefs.find((d) => d.name === traitName && d.category === category);
      if (!def) continue;
      await prisma.cubEquippedTrait.upsert({
        where: { cubId_slotCategory: { cubId, slotCategory: category as "BACKGROUND" | "BODY" | "EYES" | "HAT" | "ACCESSORIES" | "OUTFIT" | "SHOES" | "MOUTH" | "SPECIAL" } },
        update: { traitDefinitionId: def.id },
        create: { cubId, slotCategory: category as "BACKGROUND" | "BODY" | "EYES" | "HAT" | "ACCESSORIES" | "OUTFIT" | "SHOES" | "MOUTH" | "SPECIAL", traitDefinitionId: def.id },
      });
    }
  }

  // ─── Cub Versions (v1 snapshots) ──────────────────────────

  for (const cub of [cub1, cub2, cub3]) {
    const equipped = await prisma.cubEquippedTrait.findMany({
      where: { cubId: cub.id },
      include: { traitDefinition: true },
    });
    const traitSnapshot = equipped.map((e) => ({
      slotCategory: e.slotCategory,
      traitDefinitionId: e.traitDefinitionId,
      name: e.traitDefinition.name,
      imageUrl: e.traitDefinition.imageUrl,
    }));

    await prisma.cubVersion.upsert({
      where: { cubId_version: { cubId: cub.id, version: 1 } },
      update: { traitSnapshot },
      create: {
        cubId: cub.id,
        version: 1,
        imageUrl: cub.imageUrl ?? "",
        metadataUri: cub.metadataUri ?? "",
        traitSnapshot,
      },
    });
  }

  // ─── Crate Rewards (polymorphic reward entries) ──────────

  for (const crateDef of allCrateDefs) {
    // Each crate gets: trait rewards at various rarities + a PAWS reward
    const rewardConfigs = [
      { rewardType: "TRAIT" as const, weight: 40, traitRarity: "COMMON" as const },
      { rewardType: "TRAIT" as const, weight: 25, traitRarity: "UNCOMMON" as const },
      { rewardType: "TRAIT" as const, weight: 15, traitRarity: "RARE" as const },
      { rewardType: "TRAIT" as const, weight: 8, traitRarity: "EPIC" as const },
      { rewardType: "TRAIT" as const, weight: 2, traitRarity: "LEGENDARY" as const },
      { rewardType: "PAWS" as const, weight: 10, pawsMin: 50, pawsMax: 500 },
    ];

    for (const rc of rewardConfigs) {
      await prisma.crateReward.create({
        data: {
          crateDefinitionId: crateDef.id,
          rewardType: rc.rewardType,
          weight: rc.weight,
          traitRarity: rc.rewardType === "TRAIT" ? rc.traitRarity : undefined,
          pawsMin: rc.rewardType === "PAWS" ? rc.pawsMin : undefined,
          pawsMax: rc.rewardType === "PAWS" ? rc.pawsMax : undefined,
        },
      });
    }
  }

  // ─── Staking Positions (passive generation tracking) ────

  // All user1's cubs generate PAWS passively (with snapshot values)
  for (const cub of [cub1, cub2]) {
    await prisma.stakingPosition.upsert({
      where: { cubId: cub.id },
      update: {},
      create: {
        cubId: cub.id,
        userId: user1.id,
        isActive: true,
        rateSnapshot: cub.rarity === "RARE" ? 150 : cub.rarity === "EPIC" ? 200 : 100,
        flatBonusSnapshot: 15,
        snapshotAt: new Date(),
      },
    });
  }

  // cub3 owned by admin, listed on marketplace → paused
  await prisma.stakingPosition.upsert({
    where: { cubId: cub3.id },
    update: { isActive: false },
    create: {
      cubId: cub3.id,
      userId: admin.id,
      isActive: false,
      rateSnapshot: 300,
      flatBonusSnapshot: 25,
      snapshotAt: new Date(),
    },
  });

  // ─── PAWS Transactions (seed some history) ──────────────

  await prisma.pawsTransaction.createMany({
    data: [
      { userId: user1.id, amount: 1000, reason: "ADMIN_GRANT", note: "Welcome bonus" },
      { userId: user1.id, amount: 500, reason: "DAILY_CLAIM" },
      { userId: user1.id, amount: 300, reason: "STAKING_REWARD", referenceId: cub1.id },
      { userId: user1.id, amount: -200, reason: "CRATE_PURCHASE", referenceId: firstCrateDef.id },
      { userId: admin.id, amount: 5000, reason: "ADMIN_GRANT", note: "Admin test balance" },
    ],
  });

  // ─── Badges ─────────────────────────────────────────────

  const badges = [
    { name: "First Cub", description: "Own your first Cub", imageUrl: "https://placehold.co/200x200/10b981/fff?text=1st", category: "COLLECTOR" as const, requirementType: "CUBS_OWNED", requirementValue: 1, pawsReward: 100 },
    { name: "Pack Leader", description: "Own 5 Cubs", imageUrl: "https://placehold.co/200x200/10b981/fff?text=5", category: "COLLECTOR" as const, requirementType: "CUBS_OWNED", requirementValue: 5, pawsReward: 500 },
    { name: "First Trade", description: "Complete your first marketplace trade", imageUrl: "https://placehold.co/200x200/3b82f6/fff?text=Trade", category: "TRADER" as const, requirementType: "TRADES_COMPLETED", requirementValue: 1, pawsReward: 150 },
    { name: "Market Mogul", description: "Complete 25 marketplace trades", imageUrl: "https://placehold.co/200x200/3b82f6/fff?text=25", category: "TRADER" as const, requirementType: "TRADES_COMPLETED", requirementValue: 25, pawsReward: 1000 },
    { name: "Crate Opener", description: "Open 10 crates", imageUrl: "https://placehold.co/200x200/9333ea/fff?text=10", category: "MILESTONE" as const, requirementType: "CRATES_OPENED", requirementValue: 10, pawsReward: 300 },
    { name: "PAWS Millionaire", description: "Earn 1,000,000 total PAWS", imageUrl: "https://placehold.co/200x200/f59e0b/fff?text=1M", category: "MILESTONE" as const, requirementType: "PAWS_EARNED", requirementValue: 1000000, pawsReward: 5000 },
    { name: "Discord Linked", description: "Link your Discord account", imageUrl: "https://placehold.co/200x200/5865f2/fff?text=DC", category: "SOCIAL" as const, requirementType: "DISCORD_LINKED", requirementValue: 1, pawsReward: 200 },
    { name: "Daily Devotee", description: "Claim daily PAWS 30 times", imageUrl: "https://placehold.co/200x200/ef4444/fff?text=30d", category: "MILESTONE" as const, requirementType: "DAILY_CLAIMS", requirementValue: 30, pawsReward: 750 },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: { description: badge.description, requirementType: badge.requirementType, requirementValue: badge.requirementValue, pawsReward: badge.pawsReward },
      create: badge,
    });
  }

  // Award "First Cub" badge to test user
  const firstCubBadge = await prisma.badge.findUnique({ where: { name: "First Cub" } });
  if (firstCubBadge) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: user1.id, badgeId: firstCubBadge.id } },
      update: {},
      create: { userId: user1.id, badgeId: firstCubBadge.id },
    });
  }

  // ─── Economy Config (single row) ───────────────────────

  await prisma.economyConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      version: 1,
      basePawsRate: 100,
      rarityMultipliers: { COMMON: 1.0, UNCOMMON: 1.25, RARE: 1.5, EPIC: 2.0, LEGENDARY: 3.0 },
      marketplaceFeeBps: 250,
      marketplaceRoyaltyBps: 500,
      pawsTradeBurnPct: 10,
      traitBurnReturnMin: 30,
      traitBurnReturnMax: 60,
      dailyClaimAmount: 50,
      dailyClaimCooldownHrs: 24,
    },
  });

  console.log("Seed complete:");
  console.log("  2 users, 3 cubs, 12 legacy traits, 25 trait definitions, 15 user traits");
  console.log("  10 cub equipped traits, 3 cub versions (v1 snapshots)");
  console.log("  5 crate definitions, loot tables, 30 crate rewards, 5 user crate stacks");
  console.log("  5 marketplace listings, 3 staking positions (with rate snapshots)");
  console.log("  5 PAWS transactions, 8 badges, 1 user badge");
  console.log("  1 economy config (v1)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

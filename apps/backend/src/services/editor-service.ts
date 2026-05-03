import { prisma } from "../lib/prisma.js";
import { TRAIT_LAYER_ORDER } from "@cubs/shared";
import type { TraitCategory as SharedTraitCategory, EditorCubState, EditorLayerConfig, EditorSaveResult } from "@cubs/shared";
import type { TraitCategory } from "@prisma/client";
import { uploadImageToIpfs, uploadJsonToIpfs } from "../lib/ipfs.js";
import { generateCompositeImage } from "../lib/image-composer.js";
import { validateTraitOwnership, decrementUserTrait } from "./user-trait-service.js";
import { autoClaimAndUpdateSnapshot } from "./staking-service.js";
import { renderQueue } from "../lib/queue.js";

export async function getCubEditorState(cubId: string, walletAddress: string): Promise<EditorCubState | null> {
  const cub = await prisma.cub.findUnique({
    where: { id: cubId },
    include: {
      equippedTraits: { include: { traitDefinition: true } },
      owner: true,
    },
  });

  if (!cub) return null;
  if (cub.owner.walletAddress !== walletAddress.toLowerCase()) return null;

  const layers: EditorLayerConfig[] = TRAIT_LAYER_ORDER.map((category) => {
    const equipped = cub.equippedTraits.find((e) => e.slotCategory === category);
    if (equipped) {
      return {
        category: category as SharedTraitCategory,
        traitDefinitionId: equipped.traitDefinitionId,
        imageUrl: equipped.traitDefinition.imageUrl,
        name: equipped.traitDefinition.name,
      };
    }
    return {
      category: category as SharedTraitCategory,
      traitDefinitionId: null,
      imageUrl: null,
      name: null,
    };
  });

  return {
    cubId: cub.id,
    tokenId: cub.tokenId,
    name: cub.name,
    layers,
  };
}

export async function applyTraitPreview(
  cubId: string,
  walletAddress: string,
  traitDefinitionId: string,
): Promise<EditorLayerConfig | null> {
  const cub = await prisma.cub.findUnique({
    where: { id: cubId },
    include: { owner: true },
  });
  if (!cub || cub.owner.walletAddress !== walletAddress.toLowerCase()) return null;

  const traitDef = await prisma.traitDefinition.findUnique({
    where: { id: traitDefinitionId },
  });
  if (!traitDef) return null;

  const owns = await validateTraitOwnership(walletAddress, traitDefinitionId);
  if (!owns) return null;

  return {
    category: traitDef.category as SharedTraitCategory,
    traitDefinitionId: traitDef.id,
    imageUrl: traitDef.imageUrl,
    name: traitDef.name,
  };
}

interface SaveEditorInput {
  cubId: string;
  walletAddress: string;
  layers: Array<{
    category: string;
    traitDefinitionId: string | null;
  }>;
}

export async function saveEditorState(input: SaveEditorInput): Promise<EditorSaveResult> {
  const { cubId, walletAddress, layers } = input;
  const address = walletAddress.toLowerCase();

  // 1. Validate cub ownership
  const cub = await prisma.cub.findUnique({
    where: { id: cubId },
    include: { owner: true, equippedTraits: { include: { traitDefinition: true } } },
  });
  if (!cub || cub.owner.walletAddress !== address) {
    throw new Error("Cub not found or not owned by wallet");
  }

  // 2. Validate trait ownerships for all applied traits
  const appliedTraits = layers.filter((l) => l.traitDefinitionId !== null);
  const traitDefs = await Promise.all(
    appliedTraits.map(async (l) => {
      const def = await prisma.traitDefinition.findUnique({ where: { id: l.traitDefinitionId! } });
      if (!def) throw new Error(`Trait definition ${l.traitDefinitionId} not found`);
      const owns = await validateTraitOwnership(address, l.traitDefinitionId!);
      if (!owns) throw new Error(`Wallet does not own trait ${def.name}`);
      return { ...l, def };
    }),
  );

  // 3. Generate composite image
  const imageLayerInputs = traitDefs.map((t) => ({
    category: t.def.category as SharedTraitCategory,
    imageUrl: t.def.imageUrl,
  }));
  const compositeBuffer = await generateCompositeImage(imageLayerInputs);

  // 4. Upload image to IPFS
  const imageUri = await uploadImageToIpfs(compositeBuffer, `cub-${cub.tokenId}.png`);
  const imageHttpUrl = imageUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");

  // 5. Generate and upload ERC-721 metadata
  const metadata = {
    name: cub.name || `Cub #${cub.tokenId}`,
    description: cub.description || `CUBS NFT #${cub.tokenId}`,
    image: imageUri,
    attributes: traitDefs.map((t) => ({
      trait_type: t.category,
      value: t.def.name,
    })),
  };
  const metadataUri = await uploadJsonToIpfs(metadata, `cub-${cub.tokenId}-metadata`);

  // 6. Calculate new version number
  const newVersion = cub.version + 1;

  // 7. Database transaction: auto-claim staking, update equipped traits, create version, update cub
  await prisma.$transaction(async (tx) => {
    // Auto-claim staking PAWS before snapshot changes (trait change affects rates)
    await autoClaimAndUpdateSnapshot(cubId, tx);

    // Decrement user trait quantities for newly equipped traits
    for (const t of traitDefs) {
      // Only decrement if this is a NEW equip (not already equipped in same slot)
      const alreadyEquipped = cub.equippedTraits.find(
        (e) => e.slotCategory === t.category && e.traitDefinitionId === t.traitDefinitionId,
      );
      if (!alreadyEquipped) {
        await decrementUserTrait(address, t.traitDefinitionId!);
      }
    }

    // Delete old equipped traits and create new ones
    await tx.cubEquippedTrait.deleteMany({ where: { cubId } });

    const newEquippedTraits = layers
      .filter((l) => l.traitDefinitionId !== null)
      .map((l) => ({
        cubId,
        slotCategory: l.category as TraitCategory,
        traitDefinitionId: l.traitDefinitionId!,
      }));

    if (newEquippedTraits.length > 0) {
      await tx.cubEquippedTrait.createMany({ data: newEquippedTraits });
    }

    // Build trait snapshot for CubVersion
    const traitSnapshot = traitDefs.map((t) => ({
      slotCategory: t.category,
      traitDefinitionId: t.traitDefinitionId!,
      name: t.def.name,
      imageUrl: t.def.imageUrl,
    }));

    // Create immutable CubVersion snapshot
    await tx.cubVersion.create({
      data: {
        cubId,
        version: newVersion,
        imageUrl: imageHttpUrl,
        metadataUri,
        traitSnapshot,
      },
    });

    // Update cub image, metadata, and version
    await tx.cub.update({
      where: { id: cubId },
      data: {
        imageUrl: imageHttpUrl,
        metadataUri,
        version: newVersion,
      },
    });
  });

  // 8. Enqueue render job (non-blocking, fire-and-forget for downstream processing)
  await renderQueue.add(`render:${cubId}:v${newVersion}`, {
    cubId,
    version: newVersion,
    layers: traitDefs.map((t) => ({
      slotCategory: t.def.category as SharedTraitCategory,
      traitDefinitionId: t.traitDefinitionId!,
      imageUrl: t.def.imageUrl,
    })),
    requestedBy: address,
  }).catch((err) => {
    console.error("Failed to enqueue render job (non-critical):", err);
  });

  return {
    cubId,
    version: newVersion,
    imageUrl: imageHttpUrl,
    metadataUri,
  };
}

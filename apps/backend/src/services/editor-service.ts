import { prisma } from "../lib/prisma.js";
import { TRAIT_LAYER_ORDER } from "@cubs/shared";
import type { TraitCategory as SharedTraitCategory, EditorCubState, EditorLayerConfig, EditorSaveResult } from "@cubs/shared";
import type { TraitCategory } from "@prisma/client";
import { uploadImageToIpfs, uploadJsonToIpfs } from "../lib/ipfs.js";
import { generateCompositeImage } from "../lib/image-composer.js";
import { validateTraitOwnership, decrementUserTrait } from "./user-trait-service.js";

export async function getCubEditorState(cubId: string, walletAddress: string): Promise<EditorCubState | null> {
  const cub = await prisma.cub.findUnique({
    where: { id: cubId },
    include: { traits: true, owner: true },
  });

  if (!cub) return null;
  if (cub.owner.walletAddress !== walletAddress.toLowerCase()) return null;

  const layers: EditorLayerConfig[] = TRAIT_LAYER_ORDER.map((category) => {
    const existing = cub.traits.find((t) => t.traitType === category);
    return {
      category: category as SharedTraitCategory,
      traitDefinitionId: null,
      imageUrl: existing ? null : null,
      name: existing?.traitValue ?? null,
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
    include: { owner: true, traits: true },
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

  // 6. Database transaction: decrement traits, update cub traits, update cub
  await prisma.$transaction(async (tx) => {
    // Decrement user trait quantities
    for (const t of traitDefs) {
      await decrementUserTrait(address, t.traitDefinitionId!);
    }

    // Delete old cub traits
    await tx.trait.deleteMany({ where: { cubId } });

    // Create new cub traits
    const newTraits = layers
      .map((l, i) => {
        const def = traitDefs.find((t) => t.traitDefinitionId === l.traitDefinitionId);
        if (!def) return null;
        return {
          cubId,
          traitType: l.category,
          traitValue: def.def.name,
          displayOrder: i,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    if (newTraits.length > 0) {
      await tx.trait.createMany({ data: newTraits });
    }

    // Update cub image and metadata
    await tx.cub.update({
      where: { id: cubId },
      data: {
        imageUrl: imageHttpUrl,
        metadataUri,
      },
    });
  });

  return {
    cubId,
    imageUrl: imageHttpUrl,
    metadataUri,
  };
}

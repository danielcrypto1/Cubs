import type { FastifyInstance } from "fastify";
import { resolveUser } from "../../middleware/resolve-user.js";
import { getCubEditorState, applyTraitPreview, saveEditorState } from "../../services/editor-service.js";

export default async function editorRoutes(fastify: FastifyInstance) {
  // GET /api/editor/cub/:id — get cub's current layers for editor
  fastify.get("/cub/:id", { preHandler: [resolveUser] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { walletAddress } = request.resolvedUser!;

    const state = await getCubEditorState(id, walletAddress);
    if (!state) {
      return reply.status(404).send({ error: "CUB_NOT_FOUND", message: "Cub not found or not owned" });
    }

    return { data: state };
  });

  // POST /api/editor/apply-trait — validate ownership, return updated layer config (preview)
  fastify.post("/apply-trait", { preHandler: [resolveUser] }, async (request, reply) => {
    const { cubId, traitDefinitionId } = request.body as {
      cubId: string;
      traitDefinitionId: string;
    };
    const { walletAddress } = request.resolvedUser!;

    const layer = await applyTraitPreview(cubId, walletAddress, traitDefinitionId);
    if (!layer) {
      return reply.status(400).send({ error: "TRAIT_INVALID", message: "Cannot apply trait — not owned or invalid" });
    }

    return { data: layer };
  });

  // POST /api/editor/save — persist edits: composite -> IPFS -> metadata -> DB -> burn traits
  fastify.post("/save", { preHandler: [resolveUser] }, async (request, reply) => {
    const { cubId, layers } = request.body as {
      cubId: string;
      layers: Array<{ category: string; traitDefinitionId: string | null }>;
    };
    const { walletAddress } = request.resolvedUser!;

    try {
      const result = await saveEditorState({ cubId, walletAddress, layers });
      return { data: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      return reply.status(400).send({ error: "SAVE_FAILED", message });
    }
  });
}

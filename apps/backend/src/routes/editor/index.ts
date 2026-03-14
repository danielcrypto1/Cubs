import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../middleware/require-auth.js";
import { getCubEditorState, applyTraitPreview, saveEditorState } from "../../services/editor-service.js";

export default async function editorRoutes(fastify: FastifyInstance) {
  // GET /api/editor/cub/:id — get cub's current layers for editor
  fastify.get("/cub/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const address = request.session.siwe!.address;

    const state = await getCubEditorState(id, address);
    if (!state) {
      return reply.status(404).send({ error: "Cub not found or not owned" });
    }

    return { data: state };
  });

  // POST /api/editor/apply-trait — validate ownership, return updated layer config (preview)
  fastify.post("/apply-trait", { preHandler: [requireAuth] }, async (request, reply) => {
    const { cubId, traitDefinitionId } = request.body as {
      cubId: string;
      traitDefinitionId: string;
    };
    const address = request.session.siwe!.address;

    const layer = await applyTraitPreview(cubId, address, traitDefinitionId);
    if (!layer) {
      return reply.status(400).send({ error: "Cannot apply trait — not owned or invalid" });
    }

    return { data: layer };
  });

  // POST /api/editor/save — persist edits: composite → IPFS → metadata → DB → burn traits
  fastify.post("/save", { preHandler: [requireAuth] }, async (request, reply) => {
    const { cubId, layers } = request.body as {
      cubId: string;
      layers: Array<{ category: string; traitDefinitionId: string | null }>;
    };
    const address = request.session.siwe!.address;

    try {
      const result = await saveEditorState({ cubId, walletAddress: address, layers });
      return { data: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      return reply.status(400).send({ error: message });
    }
  });
}

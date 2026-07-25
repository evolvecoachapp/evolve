import type { ExplanationGraph } from "../models/ExplanationGraph";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

export function validateGraphIntegrity(
  graph: ExplanationGraph | null,
): readonly ExplanationError[] {
  if (!graph) return Object.freeze([]);
  const errors: ExplanationError[] = [];
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.fromNodeId) || !nodeIds.has(edge.toNodeId)) {
      errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Graph edge references missing node", edge.id));
    }
  }
  return Object.freeze(errors);
}

import type { DecisionGraph } from "../models/DecisionGraph";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";
import { hasCycle } from "../utils/GraphHelpers";

export function validateDecisionGraph(
  graph: DecisionGraph | null,
): readonly DecisionError[] {
  if (!graph) return Object.freeze([]);
  const errors: DecisionError[] = [];
  if (hasCycle(graph)) {
    errors.push(
      createDecisionError(
        DecisionErrorCodes.VALIDATION_FAILED,
        "Decision graph contains a cycle",
        [graph.id],
      ),
    );
  }
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.fromId) || !nodeIds.has(edge.toId)) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Graph edge references unknown node",
          [edge.id],
        ),
      );
    }
  }
  return Object.freeze(errors);
}

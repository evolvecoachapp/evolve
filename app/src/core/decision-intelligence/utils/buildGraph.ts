import type { DecisionEdge } from "../models/DecisionEdge";
import type { DecisionGraph } from "../models/DecisionGraph";
import type { DecisionNode } from "../models/DecisionNode";
import { freezeDecisionGraph } from "./freezeReports";

/**
 * Build an immutable decision graph from nodes and edges.
 */
export function buildGraph(
  generationId: string,
  nodes: readonly DecisionNode[],
  edges: readonly DecisionEdge[],
): DecisionGraph {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const rootIds = Object.freeze(
    nodes
      .filter(
        (node) =>
          node.parentIds.length === 0 ||
          node.parentIds.every((parentId) => !nodeIds.has(parentId)),
      )
      .map((node) => node.id),
  );

  return freezeDecisionGraph({
    generationId,
    nodes,
    edges,
    rootIds,
  });
}

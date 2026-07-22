import type { DecisionEdge } from "../models/DecisionEdge";
import type { DecisionGraph } from "../models/DecisionGraph";
import type { DecisionNode } from "../models/DecisionNode";
import { freezeDecisionGraph } from "./freezeReports";

function compareNodes(a: DecisionNode, b: DecisionNode): number {
  if (a.sequence !== b.sequence) {
    return a.sequence - b.sequence;
  }
  return a.id.localeCompare(b.id);
}

function compareEdges(a: DecisionEdge, b: DecisionEdge): number {
  const from = a.fromId.localeCompare(b.fromId);
  if (from !== 0) {
    return from;
  }
  const to = a.toId.localeCompare(b.toId);
  if (to !== 0) {
    return to;
  }
  return a.id.localeCompare(b.id);
}

/**
 * Normalize graph ordering and root ids for deterministic comparisons.
 */
export function normalizeGraph(graph: DecisionGraph): DecisionGraph {
  const nodes = Object.freeze([...graph.nodes].sort(compareNodes));
  const edges = Object.freeze([...graph.edges].sort(compareEdges));
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
    generationId: graph.generationId,
    nodes,
    edges,
    rootIds,
  });
}

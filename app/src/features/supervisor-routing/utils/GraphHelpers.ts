import type { RoutingEdge } from "../models/RoutingEdge";
import type { RoutingNode } from "../models/RoutingNode";

export function collectRootNodeIds(
  nodes: readonly RoutingNode[],
  edges: readonly RoutingEdge[],
): readonly string[] {
  const hasIncoming = new Set(edges.map((edge) => edge.toNodeId));
  return Object.freeze(
    nodes
      .filter((node) => !hasIncoming.has(node.id))
      .map((node) => node.id)
      .sort((a, b) => a.localeCompare(b)),
  );
}

export function collectLeafNodeIds(
  nodes: readonly RoutingNode[],
  edges: readonly RoutingEdge[],
): readonly string[] {
  const hasOutgoing = new Set(edges.map((edge) => edge.fromNodeId));
  return Object.freeze(
    nodes
      .filter((node) => !hasOutgoing.has(node.id))
      .map((node) => node.id)
      .sort((a, b) => a.localeCompare(b)),
  );
}

export function graphNodeIds(nodes: readonly RoutingNode[]): readonly string[] {
  return Object.freeze(
    nodes.map((node) => node.id).sort((a, b) => a.localeCompare(b)),
  );
}

export const GraphHelpers = Object.freeze({
  collectRootNodeIds,
  collectLeafNodeIds,
  graphNodeIds,
});

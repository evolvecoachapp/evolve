import type { ExplanationEdge } from "../models/ExplanationEdge";
import type { ExplanationNode } from "../models/ExplanationNode";

export function nodeIds(nodes: readonly ExplanationNode[]): readonly string[] {
  return Object.freeze(nodes.map((n) => n.id));
}

export function edgeCount(edges: readonly ExplanationEdge[]): number {
  return edges.length;
}

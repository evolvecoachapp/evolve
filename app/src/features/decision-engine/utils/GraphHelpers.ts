import type {
  DecisionGraph,
  DecisionGraphEdge,
  DecisionGraphNode,
} from "../models/DecisionGraph";

export function collectRoots(
  nodes: readonly DecisionGraphNode[],
  edges: readonly DecisionGraphEdge[],
): readonly string[] {
  const targets = new Set(edges.map((e) => e.toId));
  return Object.freeze(
    nodes.filter((n) => !targets.has(n.id)).map((n) => n.id),
  );
}

export function collectLeaves(
  nodes: readonly DecisionGraphNode[],
  edges: readonly DecisionGraphEdge[],
): readonly string[] {
  const sources = new Set(edges.map((e) => e.fromId));
  return Object.freeze(
    nodes.filter((n) => !sources.has(n.id)).map((n) => n.id),
  );
}

export function hasCycle(graph: DecisionGraph): boolean {
  const adj = new Map<string, string[]>();
  for (const node of graph.nodes) adj.set(node.id, []);
  for (const edge of graph.edges) {
    adj.get(edge.fromId)?.push(edge.toId);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(id: string): boolean {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const next of adj.get(id) ?? []) {
      if (dfs(next)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  }

  for (const node of graph.nodes) {
    if (dfs(node.id)) return true;
  }
  return false;
}

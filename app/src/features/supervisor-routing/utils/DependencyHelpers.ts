import type { RoutingDependency } from "../models/RoutingDependency";

/**
 * Build adjacency maps for deterministic dependency traversal.
 * Edge semantics: fromId depends on toId (toId must come first).
 */
export function buildAdjacency(
  dependencies: readonly RoutingDependency[],
): {
  readonly predecessors: ReadonlyMap<string, readonly string[]>;
  readonly successors: ReadonlyMap<string, readonly string[]>;
} {
  const pred = new Map<string, string[]>();
  const succ = new Map<string, string[]>();

  const ensure = (map: Map<string, string[]>, id: string) => {
    if (!map.has(id)) map.set(id, []);
  };

  for (const dep of dependencies) {
    ensure(pred, dep.fromId);
    ensure(pred, dep.toId);
    ensure(succ, dep.fromId);
    ensure(succ, dep.toId);
    pred.get(dep.fromId)!.push(dep.toId);
    succ.get(dep.toId)!.push(dep.fromId);
  }

  const freezeMap = (map: Map<string, string[]>) => {
    const out = new Map<string, readonly string[]>();
    for (const [key, values] of [...map.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      out.set(key, Object.freeze([...values].sort((a, b) => a.localeCompare(b))));
    }
    return out;
  };

  return Object.freeze({
    predecessors: freezeMap(pred),
    successors: freezeMap(succ),
  });
}

/**
 * Kahn topological sort — deterministic via sorted ready queue.
 * Returns null if a cycle is detected.
 */
export function topologicalSort(
  nodeIds: readonly string[],
  dependencies: readonly RoutingDependency[],
): readonly string[] | null {
  const nodes = [...new Set(nodeIds)].sort((a, b) => a.localeCompare(b));
  const { predecessors, successors } = buildAdjacency(dependencies);
  const indegree = new Map<string, number>();

  for (const id of nodes) {
    indegree.set(id, predecessors.get(id)?.length ?? 0);
  }

  const ready = nodes
    .filter((id) => (indegree.get(id) ?? 0) === 0)
    .sort((a, b) => a.localeCompare(b));
  const ordered: string[] = [];

  while (ready.length > 0) {
    const current = ready.shift()!;
    ordered.push(current);
    for (const next of successors.get(current) ?? []) {
      if (!indegree.has(next)) continue;
      const nextDegree = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, nextDegree);
      if (nextDegree === 0) {
        ready.push(next);
        ready.sort((a, b) => a.localeCompare(b));
      }
    }
  }

  if (ordered.length !== nodes.length) return null;
  return Object.freeze(ordered);
}

export function detectCycle(
  nodeIds: readonly string[],
  dependencies: readonly RoutingDependency[],
): boolean {
  return topologicalSort(nodeIds, dependencies) === null;
}

export const DependencyHelpers = Object.freeze({
  buildAdjacency,
  topologicalSort,
  detectCycle,
});

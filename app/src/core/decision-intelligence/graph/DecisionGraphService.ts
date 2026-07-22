import type { DecisionGraph } from "../models/DecisionGraph";
import type { DecisionNode } from "../models/DecisionNode";
import { buildGraph } from "../utils/buildGraph";
import { normalizeGraph } from "../utils/normalizeGraph";

/**
 * Graph helpers for dependency chains and reason propagation views.
 */
export class DecisionGraphService {
  normalize(graph: DecisionGraph): DecisionGraph {
    return normalizeGraph(graph);
  }

  getChildren(graph: DecisionGraph, nodeId: string): readonly DecisionNode[] {
    const childIds = new Set(
      graph.edges
        .filter(
          (edge) =>
            edge.fromId === nodeId &&
            (edge.kind === "derived_from" ||
              edge.kind === "depends_on" ||
              edge.kind === "sequence"),
        )
        .map((edge) => edge.toId),
    );
    for (const node of graph.nodes) {
      if (node.parentIds.includes(nodeId)) {
        childIds.add(node.id);
      }
    }
    return Object.freeze(
      graph.nodes.filter((node) => childIds.has(node.id)),
    );
  }

  getAncestors(graph: DecisionGraph, nodeId: string): readonly DecisionNode[] {
    const byId = new Map(graph.nodes.map((node) => [node.id, node]));
    const visited = new Set<string>();
    const stack = [...(byId.get(nodeId)?.parentIds ?? [])];
    const ancestors: DecisionNode[] = [];

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (visited.has(currentId)) {
        continue;
      }
      visited.add(currentId);
      const node = byId.get(currentId);
      if (!node) {
        continue;
      }
      ancestors.push(node);
      stack.push(...node.parentIds);
    }

    return Object.freeze(ancestors);
  }

  /**
   * Propagate reason codes from ancestors into a flat unique list for a node.
   */
  propagateReasons(graph: DecisionGraph, nodeId: string): readonly string[] {
    const byId = new Map(graph.nodes.map((node) => [node.id, node]));
    const node = byId.get(nodeId);
    if (!node) {
      return Object.freeze([]);
    }

    const codes = new Set<string>([
      node.summaryCode,
      ...node.reasons.map((reason) => reason.code),
    ]);

    for (const ancestor of this.getAncestors(graph, nodeId)) {
      codes.add(ancestor.summaryCode);
      for (const reason of ancestor.reasons) {
        codes.add(reason.code);
      }
    }

    return Object.freeze(Array.from(codes).sort());
  }

  rebuild(
    generationId: string,
    nodes: readonly DecisionNode[],
  ): DecisionGraph {
    return normalizeGraph(buildGraph(generationId, nodes, []));
  }
}

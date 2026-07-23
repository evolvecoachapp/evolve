import type { RoutingGraph } from "../models/RoutingGraph";
import { RoutingNodeKinds } from "../models/RoutingNode";
import {
  RoutingValidationCodes,
  type RoutingValidation,
  type RoutingValidationIssue,
} from "../models/RoutingValidation";
import { detectCycle } from "../utils/DependencyHelpers";
import { RoutingDependencyKinds } from "../models/RoutingDependency";

export function validateGraph(graph: RoutingGraph): RoutingValidation {
  const issues: RoutingValidationIssue[] = [];
  const nodeIds = new Set(graph.nodes.map((node) => node.id));

  if (new Set(graph.nodes.map((n) => n.id)).size !== graph.nodes.length) {
    issues.push({
      code: RoutingValidationCodes.GRAPH_INTEGRITY,
      message: "Graph contains duplicate node ids.",
      path: "graph.nodes",
    });
  }

  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.fromNodeId) || !nodeIds.has(edge.toNodeId)) {
      issues.push({
        code: RoutingValidationCodes.GRAPH_INTEGRITY,
        message: `Edge ${edge.id} references missing node.`,
        path: "graph.edges",
      });
    }
  }

  // Cycle checks use capability dependency edges only (not ownership links).
  const capabilityNodeIds = new Set(
    graph.nodes
      .filter((node) => node.kind === RoutingNodeKinds.CAPABILITY)
      .map((node) => node.id),
  );
  const capabilityDeps = graph.edges
    .filter(
      (edge) =>
        capabilityNodeIds.has(edge.fromNodeId) &&
        capabilityNodeIds.has(edge.toNodeId),
    )
    .map((edge) =>
      Object.freeze({
        id: edge.id,
        kind: RoutingDependencyKinds.CAPABILITY,
        fromId: edge.fromNodeId,
        toId: edge.toNodeId,
        required: edge.required,
        description: edge.label,
      }),
    );

  const cyclic = detectCycle([...capabilityNodeIds], capabilityDeps);
  if (cyclic && graph.acyclic) {
    issues.push({
      code: RoutingValidationCodes.CYCLE_DETECTED,
      message: "Graph marked acyclic but a capability cycle exists.",
      path: "graph.acyclic",
    });
  }
  if (cyclic) {
    issues.push({
      code: RoutingValidationCodes.CYCLE_DETECTED,
      message: "Graph contains a capability dependency cycle.",
      path: "graph",
    });
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues.map((issue) => Object.freeze(issue))),
  });
}

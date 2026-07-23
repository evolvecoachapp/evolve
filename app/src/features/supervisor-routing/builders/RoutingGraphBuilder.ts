import { EMPTY_ROUTING_METADATA } from "../models/RoutingMetadata";
import type { RoutingEdge } from "../models/RoutingEdge";
import type { RoutingGraph } from "../models/RoutingGraph";
import type { RoutingMetadata } from "../models/RoutingMetadata";
import type { RoutingNode } from "../models/RoutingNode";
import { freezeGraph } from "../utils/FreezeRoutingState";
import {
  collectLeafNodeIds,
  collectRootNodeIds,
} from "../utils/GraphHelpers";
import { detectCycle } from "../utils/DependencyHelpers";
import { RoutingDependencyKinds } from "../models/RoutingDependency";
import {
  sortEdgesDeterministic,
  sortNodesDeterministic,
} from "../utils/sortHelpers";

export interface RoutingGraphBuilderInput {
  readonly id: string;
  readonly planId: string;
  readonly nodes: readonly RoutingNode[];
  readonly edges: readonly RoutingEdge[];
  readonly metadata?: RoutingMetadata;
}

export class RoutingGraphBuilder {
  build(input: RoutingGraphBuilderInput): RoutingGraph {
    const nodes = sortNodesDeterministic(input.nodes);
    const edges = sortEdgesDeterministic(input.edges);
    const capabilityNodeIds = nodes
      .filter((node) => node.id.startsWith("node:capability:"))
      .map((node) => node.id);
    const capabilityDeps = edges
      .filter(
        (edge) =>
          edge.fromNodeId.startsWith("node:capability:") &&
          edge.toNodeId.startsWith("node:capability:"),
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
    const acyclic = !detectCycle(capabilityNodeIds, capabilityDeps);

    return freezeGraph({
      id: input.id,
      planId: input.planId,
      nodes,
      edges,
      rootNodeIds: collectRootNodeIds(nodes, edges),
      leafNodeIds: collectLeafNodeIds(nodes, edges),
      acyclic,
      metadata: input.metadata ?? EMPTY_ROUTING_METADATA,
    });
  }
}

export function buildRoutingGraph(
  input: RoutingGraphBuilderInput,
): RoutingGraph {
  return new RoutingGraphBuilder().build(input);
}

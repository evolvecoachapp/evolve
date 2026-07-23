import type { RoutingEdge } from "./RoutingEdge";
import type { RoutingMetadata } from "./RoutingMetadata";
import type { RoutingNode } from "./RoutingNode";

/**
 * Immutable dependency graph for a routing plan.
 */
export interface RoutingGraph {
  readonly id: string;
  readonly planId: string;
  readonly nodes: readonly RoutingNode[];
  readonly edges: readonly RoutingEdge[];
  readonly rootNodeIds: readonly string[];
  readonly leafNodeIds: readonly string[];
  readonly acyclic: boolean;
  readonly metadata: RoutingMetadata;
}

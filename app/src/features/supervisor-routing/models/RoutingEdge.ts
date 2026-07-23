/**
 * Immutable routing graph edge.
 */
export interface RoutingEdge {
  readonly id: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly required: boolean;
  readonly label: string | null;
}

/**
 * Node kinds in the routing dependency graph.
 */
export const RoutingNodeKinds = {
  CAPABILITY: "capability",
  AGENT: "agent",
  STEP: "step",
} as const;

export type RoutingNodeKind =
  (typeof RoutingNodeKinds)[keyof typeof RoutingNodeKinds];

/**
 * Immutable routing graph node.
 */
export interface RoutingNode {
  readonly id: string;
  readonly kind: RoutingNodeKind;
  readonly label: string;
  readonly subjectId: string;
  readonly agentId: string | null;
  readonly capabilityId: string | null;
}

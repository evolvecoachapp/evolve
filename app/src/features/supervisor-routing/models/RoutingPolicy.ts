/**
 * Policy kinds applied during deterministic routing.
 */
export const RoutingPolicyKinds = {
  ROUTING: "routing",
  DEPENDENCY: "dependency",
  PRIORITY: "priority",
  CAPABILITY: "capability",
  EXECUTION: "execution",
  CONSISTENCY: "consistency",
} as const;

export type RoutingPolicyKind =
  (typeof RoutingPolicyKinds)[keyof typeof RoutingPolicyKinds];

/**
 * Immutable policy descriptor recorded on a plan.
 */
export interface RoutingPolicy {
  readonly id: string;
  readonly kind: RoutingPolicyKind;
  readonly name: string;
  readonly description: string;
  readonly enabled: boolean;
}

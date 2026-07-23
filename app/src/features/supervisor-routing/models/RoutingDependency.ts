/**
 * Dependency kinds between routing subjects (capabilities or agents).
 */
export const RoutingDependencyKinds = {
  CAPABILITY: "capability",
  AGENT: "agent",
  STEP: "step",
} as const;

export type RoutingDependencyKind =
  (typeof RoutingDependencyKinds)[keyof typeof RoutingDependencyKinds];

/**
 * Immutable declared dependency edge.
 */
export interface RoutingDependency {
  readonly id: string;
  readonly kind: RoutingDependencyKind;
  readonly fromId: string;
  readonly toId: string;
  readonly required: boolean;
  readonly description: string | null;
}

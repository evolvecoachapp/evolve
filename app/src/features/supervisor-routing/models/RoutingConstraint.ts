/**
 * Constraint kinds enforced during routing (structural only).
 */
export const RoutingConstraintKinds = {
  REQUIRE_CAPABILITY: "require_capability",
  FORBID_AGENT: "forbid_agent",
  REQUIRE_AGENT: "require_agent",
  MAX_TARGETS: "max_targets",
  ACYCLIC: "acyclic",
  UNIQUE_TARGETS: "unique_targets",
} as const;

export type RoutingConstraintKind =
  (typeof RoutingConstraintKinds)[keyof typeof RoutingConstraintKinds];

/**
 * Immutable routing constraint.
 */
export interface RoutingConstraint {
  readonly id: string;
  readonly kind: RoutingConstraintKind;
  readonly subjectId: string | null;
  readonly value: string | number | boolean | null;
  readonly description: string | null;
}

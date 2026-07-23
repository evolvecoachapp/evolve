import type { RoutingMetadata } from "./RoutingMetadata";

/**
 * Decision kinds recorded during deterministic routing.
 */
export const RoutingDecisionKinds = {
  CAPABILITY_RESOLVED: "capability_resolved",
  AGENT_SELECTED: "agent_selected",
  DEPENDENCY_APPLIED: "dependency_applied",
  PRIORITY_APPLIED: "priority_applied",
  PHASE_ASSIGNED: "phase_assigned",
  ORDER_ASSIGNED: "order_assigned",
  CONSTRAINT_APPLIED: "constraint_applied",
  SKIPPED: "skipped",
} as const;

export type RoutingDecisionKind =
  (typeof RoutingDecisionKinds)[keyof typeof RoutingDecisionKinds];

/**
 * Immutable routing decision (explainable, not AI-reasoned).
 */
export interface RoutingDecision {
  readonly id: string;
  readonly kind: RoutingDecisionKind;
  readonly subjectId: string;
  readonly agentId: string | null;
  readonly capabilityId: string | null;
  readonly reason: string;
  readonly metadata: RoutingMetadata;
  readonly decidedAt: string;
}

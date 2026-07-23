/**
 * Declared routing phases (deterministic schedule buckets).
 */
export const RoutingPhaseKinds = {
  PREPARE: "prepare",
  RESOLVE: "resolve",
  PLAN: "plan",
  COLLABORATE: "collaborate",
  FINALIZE: "finalize",
} as const;

export type RoutingPhaseKind =
  (typeof RoutingPhaseKinds)[keyof typeof RoutingPhaseKinds];

export const ROUTING_PHASE_ORDER: readonly RoutingPhaseKind[] = Object.freeze([
  RoutingPhaseKinds.PREPARE,
  RoutingPhaseKinds.RESOLVE,
  RoutingPhaseKinds.PLAN,
  RoutingPhaseKinds.COLLABORATE,
  RoutingPhaseKinds.FINALIZE,
]);

/**
 * Immutable phase assignment for a routing step / target.
 */
export interface RoutingPhase {
  readonly id: string;
  readonly kind: RoutingPhaseKind;
  readonly index: number;
  readonly subjectIds: readonly string[];
  readonly description: string | null;
}

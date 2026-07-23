export const CoordinationPhaseKinds = {
  ROUTE: "route",
  PLAN: "plan",
  DISPATCH: "dispatch",
  AGGREGATE: "aggregate",
  RESPOND: "respond",
} as const;

export type CoordinationPhaseKind =
  (typeof CoordinationPhaseKinds)[keyof typeof CoordinationPhaseKinds];

/**
 * Immutable coordination phase.
 */
export interface CoordinationPhase {
  readonly id: string;
  readonly kind: CoordinationPhaseKind;
  readonly orderIndex: number;
  readonly stepIds: readonly string[];
  readonly description: string | null;
}

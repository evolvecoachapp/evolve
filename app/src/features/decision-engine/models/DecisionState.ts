import type { DecisionPackage } from "./DecisionPackage";
  import type { CoachingDecision } from "./CoachingDecision";

export const DecisionSessionStatuses = {
  IDLE: "idle",
  BUILDING: "building",
  EVALUATING: "evaluating",
  RESOLVING: "resolving",
  READY: "ready",
  FAILED: "failed",
} as const;

export type DecisionSessionStatus =
  (typeof DecisionSessionStatuses)[keyof typeof DecisionSessionStatuses];

/**
 * Immutable in-memory decision session state.
 */
export interface DecisionState {
  readonly status: DecisionSessionStatus;
  readonly package: DecisionPackage | null;
  readonly decisions: readonly CoachingDecision[];
  readonly updatedAt: string;
}

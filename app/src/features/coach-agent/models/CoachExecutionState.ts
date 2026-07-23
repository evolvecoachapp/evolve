import type { CoachMetadata } from "./CoachMetadata";

export const CoachExecutionStatuses = Object.freeze({
  IDLE: "idle" as const,
  PREPARING: "preparing" as const,
  RESOLVING: "resolving" as const,
  PLANNING: "planning" as const,
  INVOKING: "invoking" as const,
  MERGING: "merging" as const,
  EVALUATING: "evaluating" as const,
  COMPLETED: "completed" as const,
  FAILED: "failed" as const,
});

export type CoachExecutionStatus =
  (typeof CoachExecutionStatuses)[keyof typeof CoachExecutionStatuses];

/**
 * Immutable snapshot of Coach Agent execution lifecycle state.
 */
export interface CoachExecutionState {
  readonly id: string;
  readonly requestId: string | null;
  readonly planId: string | null;
  readonly status: CoachExecutionStatus;
  readonly currentAgent: string | null;
  readonly errorMessage: string | null;
  readonly metadata: CoachMetadata;
  readonly updatedAt: string;
}

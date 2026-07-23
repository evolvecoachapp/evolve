import type { AgentExecutionSummary } from "./AgentExecutionSummary";
import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";

export const CoachSupervisorExecutionStatuses = {
  IDLE: "idle",
  ROUTING: "routing",
  COORDINATING: "coordinating",
  EXECUTING: "executing",
  AGGREGATING: "aggregating",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type CoachSupervisorExecutionStatus =
  (typeof CoachSupervisorExecutionStatuses)[keyof typeof CoachSupervisorExecutionStatuses];

/**
 * Immutable execution record for a supervisor run.
 */
export interface CoachSupervisorExecution {
  readonly id: string;
  readonly requestId: string;
  readonly planId: string | null;
  readonly status: CoachSupervisorExecutionStatus;
  readonly agentSummaries: readonly AgentExecutionSummary[];
  readonly metadata: CoachSupervisorMetadata;
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly frozenAt: string;
}

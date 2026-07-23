import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";

export const AgentExecutionStatuses = {
  PENDING: "pending",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  SKIPPED: "skipped",
} as const;

export type AgentExecutionStatus =
  (typeof AgentExecutionStatuses)[keyof typeof AgentExecutionStatuses];

/**
 * Immutable summary of a specialist agent execution (orchestration view).
 */
export interface AgentExecutionSummary {
  readonly id: string;
  readonly agentId: string;
  readonly capabilityId: string | null;
  readonly role: string | null;
  readonly status: AgentExecutionStatus;
  readonly success: boolean;
  readonly message: string | null;
  readonly orderIndex: number;
  readonly provenance: string | null;
  readonly metadata: CoachSupervisorMetadata;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}

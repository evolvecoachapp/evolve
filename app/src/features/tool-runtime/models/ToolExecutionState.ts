import type { ToolExecutionStatus } from "./ToolExecutionStatus";

/**
 * Immutable snapshot of runtime execution progress for one step or plan.
 */
export interface ToolExecutionState {
  readonly id: string;
  readonly status: ToolExecutionStatus;
  readonly currentStepId: string | null;
  readonly completedStepIds: readonly string[];
  readonly failedStepIds: readonly string[];
  readonly skippedStepIds: readonly string[];
  readonly startedAt: string | null;
  readonly updatedAt: string;
  readonly message: string | null;
}

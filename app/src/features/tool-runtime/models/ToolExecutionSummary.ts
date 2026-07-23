import type { ToolExecutionStatus } from "./ToolExecutionStatus";

/**
 * Compact immutable summary of a Tool Runtime execution.
 */
export interface ToolExecutionSummary {
  readonly planId: string;
  readonly actionPlanId: string;
  readonly status: ToolExecutionStatus;
  readonly stepCount: number;
  readonly succeededCount: number;
  readonly failedCount: number;
  readonly skippedCount: number;
  readonly complete: boolean;
  readonly message: string | null;
}

import type { ToolExecutionStatus } from "./ToolExecutionStatus";
import type { ToolResult } from "./ToolResult";

/**
 * Immutable aggregate result of executing a ToolExecutionPlan.
 */
export interface ToolExecutionResult {
  readonly id: string;
  readonly requestId: string;
  readonly planId: string;
  readonly actionPlanId: string;
  readonly success: boolean;
  readonly status: ToolExecutionStatus;
  readonly results: readonly ToolResult[];
  readonly completedStepIds: readonly string[];
  readonly failedStepIds: readonly string[];
  readonly skippedStepIds: readonly string[];
  readonly message: string | null;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number | null;
}

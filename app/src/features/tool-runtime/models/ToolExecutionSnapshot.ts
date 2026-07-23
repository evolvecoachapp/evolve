import type { ToolExecutionPlan } from "./ToolExecutionPlan";
import type { ToolExecutionStatistics } from "./ToolExecutionStatistics";
import type { ToolExecutionSummary } from "./ToolExecutionSummary";

/**
 * Immutable captured view of a ToolExecutionPlan.
 */
export interface ToolExecutionSnapshot {
  readonly plan: ToolExecutionPlan;
  readonly summary: ToolExecutionSummary;
  readonly statistics: ToolExecutionStatistics;
  readonly capturedAt: string;
}

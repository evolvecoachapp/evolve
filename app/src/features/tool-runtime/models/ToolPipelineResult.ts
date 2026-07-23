import type { ToolDispatchResult } from "./ToolDispatchResult";
import type { ToolExecutionStatus } from "./ToolExecutionStatus";
import type { ToolResult } from "./ToolResult";

/**
 * Immutable aggregate output of the Execution Pipeline.
 */
export interface ToolPipelineResult {
  readonly id: string;
  readonly requestId: string;
  readonly status: ToolExecutionStatus;
  readonly dispatchResults: readonly ToolDispatchResult[];
  readonly results: readonly ToolResult[];
  readonly startedAt: string;
  readonly completedAt: string;
}

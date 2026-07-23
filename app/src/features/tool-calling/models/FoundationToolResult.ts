import type { ToolExecutionError } from "./ToolExecutionError";
import type { ToolExecutionResult } from "./ToolExecutionResult";
import type { ToolOutput } from "./ToolOutput";

/**
 * Immutable foundation ToolResult — executor output before engine wrapping.
 *
 * Distinct from the legacy `ToolResult` shape used by Conversation / Workflow.
 */
export interface FoundationToolResult {
  readonly executionId: string;
  readonly requestId: string;
  readonly callId: string;
  readonly toolId: string;
  readonly output: ToolOutput | null;
  readonly error: ToolExecutionError | null;
  readonly status: ToolExecutionResult["status"];
  readonly durationMs: number | null;
  readonly completedAt: string;
}

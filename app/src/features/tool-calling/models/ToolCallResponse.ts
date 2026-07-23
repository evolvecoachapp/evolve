import type { ToolExecutionResult } from "./ToolExecutionResult";
import type { ToolExecutionStatus } from "./ToolExecutionStatus";

/** Immutable response for a completed tool call request. */
export interface ToolCallResponse {
  readonly requestId: string;
  readonly callId: string;
  readonly toolId: string;
  readonly status: ToolExecutionStatus;
  readonly result: ToolExecutionResult;
  readonly completedAt: string;
}

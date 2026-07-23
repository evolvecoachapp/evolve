import type { ToolExecutionContext } from "./ToolExecutionContext";
import type { ToolExecutionResult } from "./ToolExecutionResult";
import type { ToolExecutionStatus } from "./ToolExecutionStatus";
import type { ToolStatus } from "./ToolStatus";

/**
 * Immutable record for one tool execution run.
 *
 * Foundation fields (`callId`, `toolId`, `context`, `result`, `ToolExecutionStatus`)
 * are preferred. Legacy fields (`toolName`, `ToolStatus`) remain for compatibility.
 */
export interface ToolExecution {
  readonly id: string;
  readonly requestId: string;
  readonly callId: string;
  readonly toolId: string;
  /** @deprecated Prefer `toolId`. */
  readonly toolName: string;
  readonly status: ToolExecutionStatus | ToolStatus;
  readonly context: ToolExecutionContext | null;
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly result: ToolExecutionResult | null;
}

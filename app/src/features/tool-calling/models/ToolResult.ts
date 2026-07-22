import type { ToolError } from "./ToolError";
import type { ToolStatus } from "./ToolStatus";

/** Outcome of a ToolExecutor run. */
export interface ToolResult {
  readonly executionId: string;
  readonly requestId: string;
  readonly toolName: string;
  readonly status: Extract<ToolStatus, "succeeded" | "failed">;
  readonly data: unknown;
  readonly error: ToolError | null;
  /** ISO-8601 timestamp. */
  readonly completedAt: string;
}

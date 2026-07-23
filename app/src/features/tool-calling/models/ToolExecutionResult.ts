import type { ToolExecutionError } from "./ToolExecutionError";
import type { ToolExecutionStatus } from "./ToolExecutionStatus";
import type { ToolOutput } from "./ToolOutput";

/** Immutable outcome produced by ToolExecutor orchestration. */
export interface ToolExecutionResult {
  readonly output: ToolOutput | null;
  readonly error: ToolExecutionError | null;
  readonly status: Extract<
    ToolExecutionStatus,
    "succeeded" | "failed" | "cancelled"
  >;
  readonly durationMs: number | null;
}

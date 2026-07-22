import type { WorkflowError } from "./WorkflowError";
import type { WorkflowStatus } from "./WorkflowStatus";

/** Outcome of a WorkflowExecutor run. */
export interface WorkflowResult {
  readonly executionId: string;
  readonly requestId: string;
  readonly workflowName: string;
  readonly status: Extract<WorkflowStatus, "succeeded" | "failed">;
  readonly data: unknown;
  readonly error: WorkflowError | null;
  /** ISO-8601 timestamp. */
  readonly completedAt: string;
}

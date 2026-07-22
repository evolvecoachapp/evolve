import type { WorkflowStatus } from "./WorkflowStatus";

/** Lifecycle record for one workflow run. */
export interface WorkflowExecution {
  readonly id: string;
  readonly requestId: string;
  readonly workflowName: string;
  readonly status: WorkflowStatus;
  /** ISO-8601 timestamp. */
  readonly startedAt: string;
  /** ISO-8601 timestamp when finished, else null. */
  readonly completedAt: string | null;
}

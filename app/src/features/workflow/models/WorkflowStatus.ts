/**
 * Lifecycle status for a workflow execution.
 */
export type WorkflowStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export const WORKFLOW_STATUSES = Object.freeze([
  "pending",
  "running",
  "succeeded",
  "failed",
  "cancelled",
] as const satisfies readonly WorkflowStatus[]);

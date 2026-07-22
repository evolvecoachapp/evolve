/**
 * Status of a single pipeline execution step.
 */
export type PipelineExecutionStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped";

export const PIPELINE_EXECUTION_STATUSES = Object.freeze([
  "pending",
  "running",
  "succeeded",
  "failed",
  "skipped",
] as const satisfies readonly PipelineExecutionStatus[]);

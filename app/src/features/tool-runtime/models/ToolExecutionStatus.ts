/**
 * Immutable execution status for Tool Runtime steps and plans.
 * Orchestration only — no domain semantics.
 */
export type ToolExecutionStatus =
  | "pending"
  | "ready"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped"
  | "cancelled"
  | "blocked";

export const ToolExecutionStatuses = Object.freeze({
  PENDING: "pending" as const,
  READY: "ready" as const,
  RUNNING: "running" as const,
  SUCCEEDED: "succeeded" as const,
  FAILED: "failed" as const,
  SKIPPED: "skipped" as const,
  CANCELLED: "cancelled" as const,
  BLOCKED: "blocked" as const,
});

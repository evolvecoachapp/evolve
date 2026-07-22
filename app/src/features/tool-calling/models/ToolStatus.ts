/**
 * Lifecycle status for a tool execution.
 */
export type ToolStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export const TOOL_STATUSES = Object.freeze([
  "pending",
  "running",
  "succeeded",
  "failed",
  "cancelled",
] as const satisfies readonly ToolStatus[]);

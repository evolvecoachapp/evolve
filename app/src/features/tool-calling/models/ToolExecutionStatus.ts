/**
 * Lifecycle status for tool execution (foundation).
 */
export type ToolExecutionStatus =
  | "pending"
  | "validating"
  | "resolving"
  | "executing"
  | "succeeded"
  | "failed"
  | "cancelled";

export const TOOL_EXECUTION_STATUSES = Object.freeze([
  "pending",
  "validating",
  "resolving",
  "executing",
  "succeeded",
  "failed",
  "cancelled",
] as const satisfies readonly ToolExecutionStatus[]);

export const TERMINAL_TOOL_EXECUTION_STATUSES = Object.freeze([
  "succeeded",
  "failed",
  "cancelled",
] as const satisfies readonly ToolExecutionStatus[]);

export function isTerminalToolExecutionStatus(
  status: ToolExecutionStatus,
): boolean {
  return (TERMINAL_TOOL_EXECUTION_STATUSES as readonly string[]).includes(
    status,
  );
}

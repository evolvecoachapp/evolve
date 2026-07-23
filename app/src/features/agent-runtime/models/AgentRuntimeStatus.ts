/**
 * Runtime lifecycle / execution status (orchestration only).
 */
export type AgentRuntimeStatus =
  | "idle"
  | "validating"
  | "selecting"
  | "planning"
  | "executing"
  | "collecting"
  | "completed"
  | "failed"
  | "cancelled";

export const AgentRuntimeStatuses = Object.freeze({
  IDLE: "idle",
  VALIDATING: "validating",
  SELECTING: "selecting",
  PLANNING: "planning",
  EXECUTING: "executing",
  COLLECTING: "collecting",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const satisfies Record<string, AgentRuntimeStatus>);

export const ALL_AGENT_RUNTIME_STATUSES: readonly AgentRuntimeStatus[] =
  Object.freeze([
    AgentRuntimeStatuses.IDLE,
    AgentRuntimeStatuses.VALIDATING,
    AgentRuntimeStatuses.SELECTING,
    AgentRuntimeStatuses.PLANNING,
    AgentRuntimeStatuses.EXECUTING,
    AgentRuntimeStatuses.COLLECTING,
    AgentRuntimeStatuses.COMPLETED,
    AgentRuntimeStatuses.FAILED,
    AgentRuntimeStatuses.CANCELLED,
  ]);

export function isTerminalRuntimeStatus(status: AgentRuntimeStatus): boolean {
  return (
    status === AgentRuntimeStatuses.COMPLETED ||
    status === AgentRuntimeStatuses.FAILED ||
    status === AgentRuntimeStatuses.CANCELLED
  );
}

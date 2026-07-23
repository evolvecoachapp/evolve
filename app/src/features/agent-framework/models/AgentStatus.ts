/**
 * Framework lifecycle / availability status for a registered agent.
 */
export type AgentStatus =
  | "unregistered"
  | "registered"
  | "initializing"
  | "ready"
  | "busy"
  | "degraded"
  | "shutting_down"
  | "shutdown"
  | "failed";

export const AgentStatuses = Object.freeze({
  UNREGISTERED: "unregistered",
  REGISTERED: "registered",
  INITIALIZING: "initializing",
  READY: "ready",
  BUSY: "busy",
  DEGRADED: "degraded",
  SHUTTING_DOWN: "shutting_down",
  SHUTDOWN: "shutdown",
  FAILED: "failed",
} as const satisfies Record<string, AgentStatus>);

export const ALL_AGENT_STATUSES: readonly AgentStatus[] = Object.freeze([
  AgentStatuses.UNREGISTERED,
  AgentStatuses.REGISTERED,
  AgentStatuses.INITIALIZING,
  AgentStatuses.READY,
  AgentStatuses.BUSY,
  AgentStatuses.DEGRADED,
  AgentStatuses.SHUTTING_DOWN,
  AgentStatuses.SHUTDOWN,
  AgentStatuses.FAILED,
]);

export function isReadyStatus(status: AgentStatus): boolean {
  return status === AgentStatuses.READY || status === AgentStatuses.BUSY;
}

export function isTerminalStatus(status: AgentStatus): boolean {
  return (
    status === AgentStatuses.SHUTDOWN || status === AgentStatuses.FAILED
  );
}

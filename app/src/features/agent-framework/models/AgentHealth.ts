import type { AgentId } from "./AgentId";

/**
 * Immutable agent health snapshot.
 */
export type AgentHealthStatus =
  | "healthy"
  | "degraded"
  | "unhealthy"
  | "unknown";

export const AgentHealthStatuses = Object.freeze({
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  UNHEALTHY: "unhealthy",
  UNKNOWN: "unknown",
} as const satisfies Record<string, AgentHealthStatus>);

export interface AgentHealth {
  readonly agentId: AgentId;
  readonly status: AgentHealthStatus;
  readonly checkedAt: string;
  readonly message: string | null;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;
}

export function createUnknownHealth(
  agentId: AgentId,
  checkedAt: string,
): AgentHealth {
  return Object.freeze({
    agentId,
    status: AgentHealthStatuses.UNKNOWN,
    checkedAt,
    message: null,
    details: Object.freeze({}),
  });
}

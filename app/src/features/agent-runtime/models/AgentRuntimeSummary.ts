import type { AgentRuntimeStatus } from "./AgentRuntimeStatus";

/**
 * Immutable human-readable runtime summary.
 */
export interface AgentRuntimeSummary {
  readonly requestId: string;
  readonly selectedAgentId: string | null;
  readonly status: AgentRuntimeStatus;
  readonly success: boolean;
  readonly message: string;
  readonly selectionReason: string | null;
  readonly fallbackUsed: boolean;
  readonly eventCount: number;
  readonly durationMs: number | null;
}

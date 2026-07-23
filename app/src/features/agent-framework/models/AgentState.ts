import type { AgentId } from "./AgentId";
import type { AgentStatus } from "./AgentStatus";

/**
 * Frozen framework lifecycle state snapshot for an agent.
 */
export interface AgentState {
  readonly agentId: AgentId;
  readonly sessionId: string | null;
  readonly status: AgentStatus;
  readonly requestId: string | null;
  readonly errorMessage: string | null;
  readonly updatedAt: string;
}

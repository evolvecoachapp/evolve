import type { AgentId } from "./AgentId";
import type { AgentMetadata } from "./AgentMetadata";
import type { AgentState } from "./AgentState";

/**
 * Immutable agent session descriptor (framework lifecycle only).
 */
export interface AgentSession {
  readonly id: string;
  readonly agentId: AgentId;
  readonly state: AgentState;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: AgentMetadata;
}

import type { AgentId } from "../models/AgentId";
import type { AgentState } from "../models/AgentState";
import type { AgentStatus } from "../models/AgentStatus";
import type { IAgent } from "./IAgent";

/**
 * Lifecycle contract — initialize / transition / shutdown only.
 * No execution logic.
 */
export interface IAgentLifecycle {
  initialize(agent: IAgent, sessionId?: string | null): AgentState;
  transition(
    agentId: AgentId,
    status: AgentStatus,
    patch?: Partial<
      Pick<AgentState, "sessionId" | "requestId" | "errorMessage">
    >,
  ): AgentState;
  shutdown(agent: IAgent): AgentState;
  getState(agentId: AgentId): AgentState | null;
  clear(agentId?: AgentId): void;
}

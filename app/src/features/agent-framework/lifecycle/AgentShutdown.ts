import type { IAgent } from "../contracts/IAgent";
import type { AgentState } from "../models/AgentState";
import { AgentStatuses } from "../models/AgentStatus";
import { freezeState } from "../utils/FreezeAgent";
import {
  AgentStateMachine,
  createAgentStateMachine,
} from "./AgentStateMachine";

/**
 * Shuts an agent down through the lifecycle machine.
 * Lifecycle only — no execution.
 */
export class AgentShutdown {
  constructor(
    private readonly stateMachine: AgentStateMachine = createAgentStateMachine(),
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  shutdown(agent: IAgent, current: AgentState | null = null): AgentState {
    const from = current?.status ?? agent.getStatus();
    if (from !== AgentStatuses.SHUTTING_DOWN && from !== AgentStatuses.SHUTDOWN) {
      this.stateMachine.assertTransition(from, AgentStatuses.SHUTTING_DOWN);
    }
    if (from !== AgentStatuses.SHUTDOWN) {
      this.stateMachine.assertTransition(
        AgentStatuses.SHUTTING_DOWN,
        AgentStatuses.SHUTDOWN,
      );
    }

    return freezeState({
      agentId: agent.id,
      sessionId: current?.sessionId ?? null,
      status: AgentStatuses.SHUTDOWN,
      requestId: current?.requestId ?? null,
      errorMessage: null,
      updatedAt: this.clock(),
    });
  }
}

export function createAgentShutdown(clock?: () => string): AgentShutdown {
  return new AgentShutdown(createAgentStateMachine(), clock);
}

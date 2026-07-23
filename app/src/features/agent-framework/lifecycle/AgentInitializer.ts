import type { IAgent } from "../contracts/IAgent";
import type { AgentState } from "../models/AgentState";
import { AgentStatuses } from "../models/AgentStatus";
import { freezeState } from "../utils/FreezeAgent";
import {
  AgentStateMachine,
  createAgentStateMachine,
} from "./AgentStateMachine";

/**
 * Initializes an agent into the framework lifecycle (ready).
 * Lifecycle only — no execution.
 */
export class AgentInitializer {
  constructor(
    private readonly stateMachine: AgentStateMachine = createAgentStateMachine(),
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  initialize(
    agent: IAgent,
    sessionId: string | null = null,
  ): AgentState {
    const current = agent.getStatus();
    const target =
      current === AgentStatuses.UNREGISTERED ||
      current === AgentStatuses.REGISTERED ||
      current === AgentStatuses.INITIALIZING ||
      current === AgentStatuses.FAILED
        ? AgentStatuses.READY
        : current;

    if (current !== target) {
      this.stateMachine.assertTransition(current, AgentStatuses.INITIALIZING);
      this.stateMachine.assertTransition(AgentStatuses.INITIALIZING, target);
    }

    return freezeState({
      agentId: agent.id,
      sessionId,
      status: target,
      requestId: null,
      errorMessage: null,
      updatedAt: this.clock(),
    });
  }
}

export function createAgentInitializer(
  clock?: () => string,
): AgentInitializer {
  return new AgentInitializer(createAgentStateMachine(), clock);
}

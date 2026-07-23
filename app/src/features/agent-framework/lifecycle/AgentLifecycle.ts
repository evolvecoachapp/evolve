import type { IAgent } from "../contracts/IAgent";
import type { IAgentLifecycle } from "../contracts/IAgentLifecycle";
import type { AgentId } from "../models/AgentId";
import { normalizeAgentId } from "../models/AgentId";
import type { AgentState } from "../models/AgentState";
import type { AgentStatus } from "../models/AgentStatus";
import { AgentStatuses } from "../models/AgentStatus";
import { freezeState } from "../utils/FreezeAgent";
import { AgentInitializer, createAgentInitializer } from "./AgentInitializer";
import {
  AgentStateMachine,
  createAgentStateMachine,
} from "./AgentStateMachine";
import { AgentShutdown, createAgentShutdown } from "./AgentShutdown";

/**
 * Agent lifecycle coordinator — initialize / transition / shutdown.
 * No execution logic.
 */
export class AgentLifecycle implements IAgentLifecycle {
  private readonly states = new Map<AgentId, AgentState>();

  constructor(
    private readonly stateMachine: AgentStateMachine = createAgentStateMachine(),
    private readonly initializer: AgentInitializer = createAgentInitializer(),
    private readonly shutdownHandler: AgentShutdown = createAgentShutdown(),
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  initialize(agent: IAgent, sessionId: string | null = null): AgentState {
    const state = this.initializer.initialize(agent, sessionId);
    this.states.set(normalizeAgentId(agent.id), state);
    return state;
  }

  transition(
    agentId: AgentId,
    status: AgentStatus,
    patch: Partial<
      Pick<AgentState, "sessionId" | "requestId" | "errorMessage">
    > = {},
  ): AgentState {
    const id = normalizeAgentId(agentId);
    const current = this.states.get(id);
    const from = current?.status ?? AgentStatuses.UNREGISTERED;
    this.stateMachine.assertTransition(from, status);

    const next = freezeState({
      agentId: id,
      sessionId: patch.sessionId !== undefined ? patch.sessionId : (current?.sessionId ?? null),
      status,
      requestId:
        patch.requestId !== undefined
          ? patch.requestId
          : (current?.requestId ?? null),
      errorMessage:
        patch.errorMessage !== undefined
          ? patch.errorMessage
          : (current?.errorMessage ?? null),
      updatedAt: this.clock(),
    });
    this.states.set(id, next);
    return next;
  }

  shutdown(agent: IAgent): AgentState {
    const id = normalizeAgentId(agent.id);
    const current = this.states.get(id) ?? null;
    const next = this.shutdownHandler.shutdown(agent, current);
    this.states.set(id, next);
    return next;
  }

  getState(agentId: AgentId): AgentState | null {
    return this.states.get(normalizeAgentId(agentId)) ?? null;
  }

  clear(agentId?: AgentId): void {
    if (agentId) {
      this.states.delete(normalizeAgentId(agentId));
      return;
    }
    this.states.clear();
  }
}

export function createAgentLifecycle(
  clock?: () => string,
): AgentLifecycle {
  const stateMachine = createAgentStateMachine();
  return new AgentLifecycle(
    stateMachine,
    createAgentInitializer(clock),
    createAgentShutdown(clock),
    clock,
  );
}

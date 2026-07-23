import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentRuntimeDescriptor } from "../models/AgentRuntimeDescriptor";
import type { AgentRuntimeExecutor } from "../models/AgentRuntimeExecutor";
import type { AgentRuntimeRequest } from "../models/AgentRuntimeRequest";
import type { AgentRuntimeResponse } from "../models/AgentRuntimeResponse";
import {
  AgentRuntime,
  createAgentRuntime,
  type AgentRuntimeDeps,
} from "../runtime/AgentRuntime";

/**
 * Agent Runtime Service — runs the complete runtime flow.
 * Returns immutable responses. No business logic.
 */
export class AgentRuntimeService {
  private readonly runtime: AgentRuntime;

  constructor(deps: AgentRuntimeDeps = {}) {
    this.runtime = createAgentRuntime(deps);
  }

  getRuntime(): AgentRuntime {
    return this.runtime;
  }

  registerAgent(
    agent: IAgent,
    options: { readonly executor?: AgentRuntimeExecutor | null } = {},
  ): void {
    this.runtime.registerAgent(agent, options);
  }

  unregisterAgent(agentId: string): boolean {
    return this.runtime.unregisterAgent(agentId);
  }

  listAgents(): readonly IAgent[] {
    return this.runtime.listAgents();
  }

  describeAgent(agentId: string): AgentRuntimeDescriptor | null {
    return this.runtime.describeAgent(agentId);
  }

  async execute(request: AgentRuntimeRequest): Promise<AgentRuntimeResponse> {
    return this.runtime.execute(request);
  }
}

export function createAgentRuntimeService(
  deps: AgentRuntimeDeps = {},
): AgentRuntimeService {
  return new AgentRuntimeService(deps);
}

export type { AgentRuntimeDeps as AgentRuntimeServiceDeps };

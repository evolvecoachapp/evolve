import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentRuntimeDescriptor } from "../models/AgentRuntimeDescriptor";
import type { AgentRuntimeExecutor } from "../models/AgentRuntimeExecutor";
import type { AgentRuntimeRequest } from "../models/AgentRuntimeRequest";
import type { AgentRuntimeResponse } from "../models/AgentRuntimeResponse";
import {
  createAgentRuntimeService,
  type AgentRuntimeService,
  type AgentRuntimeServiceDeps,
} from "../services/AgentRuntimeService";

function resolveService(
  service?: AgentRuntimeService,
  deps?: AgentRuntimeServiceDeps,
): AgentRuntimeService {
  return service ?? createAgentRuntimeService(deps);
}

/**
 * Public API — execute a request through the Agent Runtime.
 */
export async function executeAgent(options: {
  readonly request: AgentRuntimeRequest;
  readonly service?: AgentRuntimeService;
  readonly clock?: AgentRuntimeServiceDeps["clock"];
  readonly nowMs?: AgentRuntimeServiceDeps["nowMs"];
}): Promise<AgentRuntimeResponse> {
  const { request, service, clock, nowMs } = options;
  const resolved = resolveService(
    service,
    clock || nowMs ? { clock, nowMs } : undefined,
  );
  return resolved.execute(request);
}

/**
 * Public API — list registered agents.
 */
export function listAgents(options: {
  readonly service?: AgentRuntimeService;
} = {}): readonly IAgent[] {
  return resolveService(options.service).listAgents();
}

/**
 * Public API — describe a registered agent.
 */
export function describeAgent(options: {
  readonly agentId: string;
  readonly service?: AgentRuntimeService;
}): AgentRuntimeDescriptor | null {
  return resolveService(options.service).describeAgent(options.agentId);
}

/**
 * Public API — register an IAgent with the runtime.
 */
export function registerAgent(options: {
  readonly agent: IAgent;
  readonly executor?: AgentRuntimeExecutor | null;
  readonly service?: AgentRuntimeService;
  readonly clock?: AgentRuntimeServiceDeps["clock"];
}): void {
  const resolved = resolveService(
    options.service,
    options.clock ? { clock: options.clock } : undefined,
  );
  resolved.registerAgent(options.agent, { executor: options.executor });
}

/**
 * Public API — unregister an agent from the runtime.
 */
export function unregisterAgent(options: {
  readonly agentId: string;
  readonly service?: AgentRuntimeService;
}): boolean {
  return resolveService(options.service).unregisterAgent(options.agentId);
}

export type { AgentRuntimeServiceDeps };

import type { IAgent } from "../contracts/IAgent";
import type { AgentCapabilityKey } from "../models/AgentCapabilityKey";
import type { AgentId } from "../models/AgentId";
import type { AgentRole } from "../models/AgentRole";
import type { AgentSnapshot } from "../models/AgentSnapshot";
import {
  createAgentFrameworkService,
  type AgentFrameworkService,
  type AgentFrameworkServiceDeps,
} from "../services/AgentFrameworkService";

function resolveService(
  service?: AgentFrameworkService,
  deps?: AgentFrameworkServiceDeps,
): AgentFrameworkService {
  return service ?? createAgentFrameworkService(deps);
}

/**
 * Public API — register an agent contract with the framework.
 */
export function registerAgent(options: {
  readonly agent: IAgent;
  readonly service?: AgentFrameworkService;
  readonly clock?: AgentFrameworkServiceDeps["clock"];
}): void {
  const resolved = resolveService(
    options.service,
    options.clock ? { clock: options.clock } : undefined,
  );
  resolved.registerAgent(options.agent);
}

/**
 * Public API — resolve a registered agent by id, role, capability, or default.
 */
export function resolveAgent(options: {
  readonly agentId?: AgentId | null;
  readonly role?: AgentRole | null;
  readonly capability?: AgentCapabilityKey | null;
  readonly service?: AgentFrameworkService;
  readonly clock?: AgentFrameworkServiceDeps["clock"];
} = {}): IAgent {
  const { service, clock, ...rest } = options;
  const resolved = resolveService(
    service,
    clock ? { clock } : undefined,
  );
  return resolved.resolveAgent(rest);
}

/**
 * Public API — list registered agents.
 */
export function listAgents(options: {
  readonly service?: AgentFrameworkService;
} = {}): readonly IAgent[] {
  return resolveService(options.service).listAgents();
}

/**
 * Public API — describe a registered agent as an immutable snapshot.
 */
export function describeAgent(options: {
  readonly agentId: AgentId;
  readonly service?: AgentFrameworkService;
  readonly clock?: AgentFrameworkServiceDeps["clock"];
}): AgentSnapshot | null {
  const resolved = resolveService(
    options.service,
    options.clock ? { clock: options.clock } : undefined,
  );
  return resolved.describeAgent(options.agentId);
}

/**
 * Public API — soft-validate a registered agent.
 */
export function validateAgent(options: {
  readonly agentId: AgentId;
  readonly service?: AgentFrameworkService;
}): readonly string[] {
  return resolveService(options.service).validateAgent(options.agentId);
}

export type { AgentFrameworkServiceDeps };

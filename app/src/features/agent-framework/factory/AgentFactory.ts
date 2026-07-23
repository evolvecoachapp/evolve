import type { IAgent } from "../contracts/IAgent";
import type { IAgentFactory } from "../contracts/IAgentFactory";
import type { IAgentRegistry } from "../contracts/IAgentRegistry";
import { AgentError } from "../models/AgentError";
import type { AgentCapabilityKey } from "../models/AgentCapabilityKey";
import type { AgentId } from "../models/AgentId";
import { normalizeAgentId } from "../models/AgentId";
import type { AgentRole } from "../models/AgentRole";
import { createAgentRegistry } from "../registry/AgentRegistry";
import { validateAgentId } from "../validators";

/**
 * Resolves registered agent contracts by id, role, capability, or default.
 *
 * No concrete domain agents. No networking.
 */
export class AgentFactory implements IAgentFactory {
  private defaultAgentId: AgentId | null = null;

  constructor(private readonly registry: IAgentRegistry) {}

  resolveById(agentId: AgentId): IAgent {
    const idIssues = validateAgentId(agentId);
    if (idIssues.length > 0) {
      throw new AgentError(
        "invalid_agent_id",
        `Invalid agent id: ${idIssues.join(", ")}`,
        agentId,
      );
    }

    const normalizedId = normalizeAgentId(agentId);
    const availability = this.registry.validateAvailability(normalizedId);
    if (availability.length > 0) {
      throw new AgentError(
        "agent_unavailable",
        `Agent unavailable: ${availability.join(", ")}`,
        normalizedId,
      );
    }

    const agent = this.registry.resolve(normalizedId);
    if (!agent) {
      throw new AgentError(
        "agent_not_found",
        `Agent not found: ${normalizedId}`,
        normalizedId,
      );
    }

    return agent;
  }

  resolveByRole(role: AgentRole): IAgent {
    for (const agent of this.registry.list()) {
      if (
        agent.getRole() === role &&
        this.registry.isAvailable(agent.id)
      ) {
        return this.resolveById(agent.id);
      }
    }

    throw new AgentError(
      "role_not_found",
      `No available agent for role: ${role}`,
    );
  }

  resolveByCapability(capability: AgentCapabilityKey): IAgent {
    for (const agent of this.registry.list()) {
      if (
        agent.supports(capability) &&
        this.registry.isAvailable(agent.id)
      ) {
        return this.resolveById(agent.id);
      }
    }

    throw new AgentError(
      "capability_not_found",
      `No available agent supports capability: ${capability}`,
    );
  }

  resolveDefault(): IAgent {
    if (this.defaultAgentId) {
      return this.resolveById(this.defaultAgentId);
    }

    const available = this.registry
      .list()
      .find((agent) => this.registry.isAvailable(agent.id));

    if (!available) {
      throw new AgentError(
        "no_default_agent",
        "No default agent configured and no available agents registered",
      );
    }

    return available;
  }

  setDefaultAgentId(agentId: AgentId): void {
    const normalizedId = normalizeAgentId(agentId);
    if (!this.registry.has(normalizedId)) {
      throw new AgentError(
        "agent_not_found",
        `Cannot set default — agent not registered: ${normalizedId}`,
        normalizedId,
      );
    }
    this.defaultAgentId = normalizedId;
  }

  getDefaultAgentId(): AgentId | null {
    return this.defaultAgentId;
  }
}

export function createAgentFactory(
  registry?: IAgentRegistry,
): AgentFactory {
  return new AgentFactory(registry ?? createAgentRegistry());
}

import type { IAgent } from "../contracts/IAgent";
import type { IAgentRegistry } from "../contracts/IAgentRegistry";
import { AgentError } from "../models/AgentError";
import type { AgentId } from "../models/AgentId";
import { normalizeAgentId } from "../models/AgentId";
import { AgentStatuses } from "../models/AgentStatus";
import {
  validateCapabilities,
  validateConfiguration,
  validateAgentId,
  validateRegistration,
} from "../validators";

/**
 * In-memory Agent Registry.
 *
 * Register / resolve / list / availability validation only.
 * No concrete domain agents.
 */
export class AgentRegistry implements IAgentRegistry {
  private readonly agents = new Map<AgentId, IAgent>();

  register(agent: IAgent): void {
    const idIssues = validateAgentId(agent.id);
    if (idIssues.length > 0) {
      throw new AgentError(
        "invalid_agent_id",
        `Cannot register agent: ${idIssues.join(", ")}`,
        agent.id,
      );
    }

    const normalizedId = normalizeAgentId(agent.id);
    if (this.agents.has(normalizedId)) {
      throw new AgentError(
        "agent_already_registered",
        `Agent already registered: ${normalizedId}`,
        normalizedId,
      );
    }

    const registrationIssues = validateRegistration(agent);
    const hardIssues = registrationIssues.filter(
      (issue) =>
        issue === "agent_missing" ||
        issue === "agent_name_missing" ||
        issue === "agent_version_missing" ||
        issue === "capabilities_missing" ||
        issue === "configuration_missing" ||
        issue === "agent_identity_id_mismatch" ||
        issue === "agent_configuration_id_mismatch" ||
        issue.startsWith("agent_id_"),
    );
    if (hardIssues.length > 0) {
      throw new AgentError(
        "invalid_agent_registration",
        `Cannot register agent: ${hardIssues.join(", ")}`,
        normalizedId,
      );
    }

    const configIssues = validateConfiguration(agent.getConfiguration());
    const hardConfig = configIssues.filter(
      (issue) =>
        issue === "configuration_missing" ||
        issue.startsWith("agent_id_") ||
        issue === "configuration_enabled_invalid",
    );
    if (hardConfig.length > 0) {
      throw new AgentError(
        "invalid_agent_configuration",
        `Cannot register agent: ${hardConfig.join(", ")}`,
        normalizedId,
      );
    }

    const capabilityIssues = validateCapabilities(agent.getCapabilities());
    if (capabilityIssues.includes("capabilities_missing")) {
      throw new AgentError(
        "invalid_agent_capabilities",
        "Cannot register agent: capabilities_missing",
        normalizedId,
      );
    }

    this.agents.set(normalizedId, agent);
  }

  unregister(agentId: AgentId): boolean {
    return this.agents.delete(normalizeAgentId(agentId));
  }

  resolve(agentId: AgentId): IAgent | null {
    return this.agents.get(normalizeAgentId(agentId)) ?? null;
  }

  list(): readonly IAgent[] {
    return Object.freeze([...this.agents.values()]);
  }

  has(agentId: AgentId): boolean {
    return this.agents.has(normalizeAgentId(agentId));
  }

  isAvailable(agentId: AgentId): boolean {
    return this.validateAvailability(agentId).length === 0;
  }

  validateAvailability(agentId: AgentId): readonly string[] {
    const issues: string[] = [];
    const normalizedId = normalizeAgentId(agentId);
    issues.push(...validateAgentId(normalizedId));
    if (issues.length > 0) {
      return Object.freeze(issues);
    }

    const agent = this.agents.get(normalizedId);
    if (!agent) {
      issues.push(`agent_not_registered:${normalizedId}`);
      return Object.freeze(issues);
    }

    const status = agent.getStatus();
    if (status === AgentStatuses.SHUTDOWN) {
      issues.push(`agent_shutdown:${normalizedId}`);
    } else if (status === AgentStatuses.FAILED) {
      issues.push(`agent_failed:${normalizedId}`);
    } else if (status === AgentStatuses.UNREGISTERED) {
      issues.push(`agent_unregistered_status:${normalizedId}`);
    } else if (status === AgentStatuses.SHUTTING_DOWN) {
      issues.push(`agent_shutting_down:${normalizedId}`);
    }

    if (!agent.getConfiguration().enabled) {
      issues.push(`agent_configuration_disabled:${normalizedId}`);
    }

    return Object.freeze(issues);
  }

  clear(): void {
    this.agents.clear();
  }
}

export function createAgentRegistry(): AgentRegistry {
  return new AgentRegistry();
}

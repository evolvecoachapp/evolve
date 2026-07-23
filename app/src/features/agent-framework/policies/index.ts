import type { IAgent } from "../contracts/IAgent";
import type { AgentDependency } from "../models/AgentDependency";
import type { AgentHealth } from "../models/AgentHealth";
import { AgentHealthStatuses } from "../models/AgentHealth";
import type { AgentPriority } from "../models/AgentPriority";
import { AGENT_PRIORITY_RANK } from "../models/AgentPriority";
import { AgentStatuses } from "../models/AgentStatus";
import { validateRegistration } from "../validators";

export interface RegistrationPolicy {
  readonly id: string;
  evaluate(agent: IAgent): readonly string[];
}

export const DefaultRegistrationPolicy: RegistrationPolicy = Object.freeze({
  id: "registration.default",
  evaluate(agent: IAgent): readonly string[] {
    return validateRegistration(agent);
  },
});

export interface DependencyPolicy {
  readonly id: string;
  evaluate(
    dependencies: readonly AgentDependency[],
    resolveAgent: (id: string) => IAgent | null,
    supportsCapability: (key: string) => boolean,
  ): readonly string[];
}

export const DefaultDependencyPolicy: DependencyPolicy = Object.freeze({
  id: "dependency.default",
  evaluate(
    dependencies: readonly AgentDependency[],
    resolveAgent: (id: string) => IAgent | null,
    supportsCapability: (key: string) => boolean,
  ): readonly string[] {
    const issues: string[] = [];
    for (const dep of dependencies) {
      if (!dep.required) {
        continue;
      }
      if (dep.kind === "agent") {
        if (!resolveAgent(String(dep.targetId))) {
          issues.push(`required_agent_missing:${dep.targetId}`);
        }
      } else if (!supportsCapability(String(dep.targetId))) {
        issues.push(`required_capability_missing:${dep.targetId}`);
      }
    }
    return Object.freeze(issues);
  },
});

export interface PriorityPolicy {
  readonly id: string;
  compare(a: AgentPriority, b: AgentPriority): number;
  isAtLeast(priority: AgentPriority, minimum: AgentPriority): boolean;
}

export const DefaultPriorityPolicy: PriorityPolicy = Object.freeze({
  id: "priority.default",
  compare(a: AgentPriority, b: AgentPriority): number {
    return AGENT_PRIORITY_RANK[a] - AGENT_PRIORITY_RANK[b];
  },
  isAtLeast(priority: AgentPriority, minimum: AgentPriority): boolean {
    return AGENT_PRIORITY_RANK[priority] >= AGENT_PRIORITY_RANK[minimum];
  },
});

export interface AvailabilityPolicy {
  readonly id: string;
  evaluate(agent: IAgent): readonly string[];
}

export const DefaultAvailabilityPolicy: AvailabilityPolicy = Object.freeze({
  id: "availability.default",
  evaluate(agent: IAgent): readonly string[] {
    const issues: string[] = [];
    const status = agent.getStatus();
    if (
      status === AgentStatuses.SHUTDOWN ||
      status === AgentStatuses.FAILED ||
      status === AgentStatuses.UNREGISTERED ||
      status === AgentStatuses.SHUTTING_DOWN
    ) {
      issues.push(`agent_unavailable_status:${status}`);
    }
    if (!agent.getConfiguration().enabled) {
      issues.push("agent_disabled");
    }
    return Object.freeze(issues);
  },
});

export interface HealthPolicy {
  readonly id: string;
  evaluate(health: AgentHealth): readonly string[];
}

export const DefaultHealthPolicy: HealthPolicy = Object.freeze({
  id: "health.default",
  evaluate(health: AgentHealth): readonly string[] {
    if (health.status === AgentHealthStatuses.HEALTHY) {
      return Object.freeze([]);
    }
    if (health.status === AgentHealthStatuses.DEGRADED) {
      return Object.freeze([`agent_degraded:${health.agentId}`]);
    }
    return Object.freeze([`agent_unhealthy:${health.agentId}`]);
  },
});

import type { IAgent } from "../contracts/IAgent";
import type { AgentCapabilityKey } from "../models/AgentCapabilityKey";
import type { AgentPriority } from "../models/AgentPriority";
import { AGENT_PRIORITY_RANK } from "../models/AgentPriority";
import type { AgentRole } from "../models/AgentRole";
import type { AgentDependency } from "../models/AgentDependency";

export class AgentSelector {
  selectById(agents: readonly IAgent[], agentId: string): IAgent | null {
    return agents.find((agent) => agent.id === agentId) ?? null;
  }

  selectAvailable(
    agents: readonly IAgent[],
    isAvailable: (agentId: string) => boolean,
  ): readonly IAgent[] {
    return Object.freeze(agents.filter((agent) => isAvailable(agent.id)));
  }
}

export class CapabilitySelector {
  selectSupporting(
    agents: readonly IAgent[],
    capability: AgentCapabilityKey,
  ): readonly IAgent[] {
    return Object.freeze(
      agents.filter((agent) => agent.supports(capability)),
    );
  }

  selectFirstSupporting(
    agents: readonly IAgent[],
    capability: AgentCapabilityKey,
  ): IAgent | null {
    return this.selectSupporting(agents, capability)[0] ?? null;
  }
}

export class RoleSelector {
  selectByRole(agents: readonly IAgent[], role: AgentRole): readonly IAgent[] {
    return Object.freeze(agents.filter((agent) => agent.getRole() === role));
  }

  selectFirstByRole(agents: readonly IAgent[], role: AgentRole): IAgent | null {
    return this.selectByRole(agents, role)[0] ?? null;
  }
}

export class PrioritySelector {
  sortByPriority(agents: readonly IAgent[]): readonly IAgent[] {
    return Object.freeze(
      [...agents].sort((a, b) => {
        const aPriority = a.getConfiguration().priority;
        const bPriority = b.getConfiguration().priority;
        return AGENT_PRIORITY_RANK[bPriority] - AGENT_PRIORITY_RANK[aPriority];
      }),
    );
  }

  selectHighest(agents: readonly IAgent[]): IAgent | null {
    return this.sortByPriority(agents)[0] ?? null;
  }

  selectByPriority(
    agents: readonly IAgent[],
    priority: AgentPriority,
  ): readonly IAgent[] {
    return Object.freeze(
      agents.filter((agent) => agent.getConfiguration().priority === priority),
    );
  }
}

export class DependencySelector {
  selectRequired(
    dependencies: readonly AgentDependency[],
  ): readonly AgentDependency[] {
    return Object.freeze(dependencies.filter((dep) => dep.required));
  }

  selectOptional(
    dependencies: readonly AgentDependency[],
  ): readonly AgentDependency[] {
    return Object.freeze(dependencies.filter((dep) => !dep.required));
  }

  selectByKind(
    dependencies: readonly AgentDependency[],
    kind: AgentDependency["kind"],
  ): readonly AgentDependency[] {
    return Object.freeze(dependencies.filter((dep) => dep.kind === kind));
  }
}

export function createAgentSelector(): AgentSelector {
  return new AgentSelector();
}

export function createCapabilitySelector(): CapabilitySelector {
  return new CapabilitySelector();
}

export function createRoleSelector(): RoleSelector {
  return new RoleSelector();
}

export function createPrioritySelector(): PrioritySelector {
  return new PrioritySelector();
}

export function createDependencySelector(): DependencySelector {
  return new DependencySelector();
}

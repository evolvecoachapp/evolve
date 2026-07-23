import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentCapabilityKey } from "../../agent-framework/models/AgentCapabilityKey";
import { AGENT_PRIORITY_RANK } from "../../agent-framework/models/AgentPriority";
import type { AgentPriority } from "../../agent-framework/models/AgentPriority";
import type { AgentRole } from "../../agent-framework/models/AgentRole";
import type { AgentRuntimeRequest } from "../models/AgentRuntimeRequest";
import type { AgentRuntimeSelection } from "../models/AgentRuntimeSelection";
import { AgentRuntimeException } from "../models/AgentRuntimeError";
import { freezeSelection } from "../utils/FreezeRuntime";
import { isAgentAvailable, stableAgentSort } from "../utils/RuntimeHelpers";

export interface AgentSelectorOptions {
  readonly preferAvailable?: boolean;
}

/**
 * Deterministic agent selection — role, capability, priority, fallback.
 * No AI.
 */
export class AgentSelector {
  constructor(private readonly options: AgentSelectorOptions = {}) {}

  select(
    agents: readonly IAgent[],
    request: AgentRuntimeRequest,
  ): AgentRuntimeSelection {
    const pool = this.options.preferAvailable === false
      ? agents
      : agents.filter(isAgentAvailable);

    if (request.agentId) {
      const byId = pool.find((a) => a.id === request.agentId) ?? null;
      if (byId) {
        return this.outcome(byId, "agent_id", request.capability, false, pool.length);
      }
    }

    if (request.role) {
      const byRole = this.byRole(pool, request.role, request.priority);
      if (byRole) {
        return this.outcome(
          byRole,
          "role",
          request.capability,
          false,
          pool.length,
        );
      }
    }

    if (request.capability) {
      const byCap = this.byCapability(
        pool,
        request.capability,
        request.priority,
      );
      if (byCap) {
        return this.outcome(
          byCap,
          "capability",
          request.capability,
          false,
          pool.length,
        );
      }
    }

    if (request.fallbackRole) {
      const byFallbackRole = this.byRole(
        pool,
        request.fallbackRole,
        request.priority,
      );
      if (byFallbackRole) {
        return this.outcome(
          byFallbackRole,
          "fallback_role",
          request.capability,
          true,
          pool.length,
        );
      }
    }

    if (request.fallbackCapability) {
      const byFallbackCap = this.byCapability(
        pool,
        request.fallbackCapability,
        request.priority,
      );
      if (byFallbackCap) {
        return this.outcome(
          byFallbackCap,
          "fallback_capability",
          request.fallbackCapability,
          true,
          pool.length,
        );
      }
    }

    if (request.priority) {
      const byPriority = this.byPriority(pool, request.priority);
      if (byPriority) {
        return this.outcome(
          byPriority,
          "priority",
          request.capability,
          false,
          pool.length,
        );
      }
    }

    throw new AgentRuntimeException(
      "agent_not_selected",
      "No agent matched selection criteria",
      request.agentId,
      Object.freeze({
        role: request.role,
        capability: request.capability,
        fallbackRole: request.fallbackRole,
        fallbackCapability: request.fallbackCapability,
        candidates: pool.length,
      }),
    );
  }

  selectByRole(
    agents: readonly IAgent[],
    role: AgentRole,
    priority?: AgentPriority | null,
  ): IAgent | null {
    return this.byRole(agents, role, priority ?? null);
  }

  selectByCapability(
    agents: readonly IAgent[],
    capability: AgentCapabilityKey,
    priority?: AgentPriority | null,
  ): IAgent | null {
    return this.byCapability(agents, capability, priority ?? null);
  }

  selectHighestPriority(agents: readonly IAgent[]): IAgent | null {
    const ranked = this.rankByPriority(agents);
    return ranked[0] ?? null;
  }

  private byRole(
    agents: readonly IAgent[],
    role: AgentRole,
    priority: AgentPriority | null,
  ): IAgent | null {
    let candidates = agents.filter((a) => a.getRole() === role);
    if (priority) {
      candidates = candidates.filter(
        (a) => a.getConfiguration().priority === priority,
      );
    }
    return this.rankByPriority(candidates)[0] ?? null;
  }

  private byCapability(
    agents: readonly IAgent[],
    capability: AgentCapabilityKey,
    priority: AgentPriority | null,
  ): IAgent | null {
    let candidates = agents.filter((a) => a.supports(capability));
    if (priority) {
      candidates = candidates.filter(
        (a) => a.getConfiguration().priority === priority,
      );
    }
    return this.rankByPriority(candidates)[0] ?? null;
  }

  private byPriority(
    agents: readonly IAgent[],
    priority: AgentPriority,
  ): IAgent | null {
    return (
      this.rankByPriority(
        agents.filter((a) => a.getConfiguration().priority === priority),
      )[0] ?? null
    );
  }

  private rankByPriority(agents: readonly IAgent[]): readonly IAgent[] {
    return Object.freeze(
      [...agents].sort((a, b) => {
        const rankDiff =
          AGENT_PRIORITY_RANK[b.getConfiguration().priority] -
          AGENT_PRIORITY_RANK[a.getConfiguration().priority];
        if (rankDiff !== 0) return rankDiff;
        return a.id.localeCompare(b.id);
      }),
    );
  }

  private outcome(
    agent: IAgent,
    matchedBy: AgentRuntimeSelection["matchedBy"],
    capability: AgentCapabilityKey | null,
    fallbackUsed: boolean,
    candidatesConsidered: number,
  ): AgentRuntimeSelection {
    return freezeSelection({
      agent,
      agentId: agent.id,
      role: agent.getRole(),
      matchedBy,
      capability,
      fallbackUsed,
      reason: `Selected by ${matchedBy}: ${agent.id}`,
      candidatesConsidered,
    });
  }
}

export function createAgentSelector(
  options?: AgentSelectorOptions,
): AgentSelector {
  return new AgentSelector(options);
}

export { stableAgentSort };

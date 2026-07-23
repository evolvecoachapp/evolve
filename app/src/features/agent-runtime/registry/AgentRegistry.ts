import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentCapabilityKey } from "../../agent-framework/models/AgentCapabilityKey";
import type { AgentId } from "../../agent-framework/models/AgentId";
import { normalizeAgentId } from "../../agent-framework/models/AgentId";
import type { AgentRole } from "../../agent-framework/models/AgentRole";
import type { AgentRuntimeExecutor } from "../models/AgentRuntimeExecutor";
import { AgentRuntimeException } from "../models/AgentRuntimeError";
import { capabilityKeysOf, stableAgentSort } from "../utils/RuntimeHelpers";

export interface AgentRegistryEntry {
  readonly agent: IAgent;
  readonly executor: AgentRuntimeExecutor | null;
  readonly registeredAt: string;
}

/**
 * Immutable Agent Registry.
 *
 * register / unregister return a new registry instance.
 * Lookup by role, capability, and identifier.
 */
export class AgentRegistry {
  private readonly entries: ReadonlyMap<AgentId, AgentRegistryEntry>;

  private constructor(entries: ReadonlyMap<AgentId, AgentRegistryEntry>) {
    this.entries = entries;
  }

  static empty(): AgentRegistry {
    return new AgentRegistry(new Map());
  }

  static fromEntries(
    entries: readonly AgentRegistryEntry[],
  ): AgentRegistry {
    const map = new Map<AgentId, AgentRegistryEntry>();
    for (const entry of entries) {
      map.set(normalizeAgentId(entry.agent.id), Object.freeze({ ...entry }));
    }
    return new AgentRegistry(map);
  }

  register(
    agent: IAgent,
    options: {
      readonly executor?: AgentRuntimeExecutor | null;
      readonly registeredAt: string;
    },
  ): AgentRegistry {
    const id = normalizeAgentId(agent.id);
    if (!id) {
      throw new AgentRuntimeException(
        "invalid_agent_id",
        "Cannot register agent with empty id",
      );
    }
    if (this.entries.has(id)) {
      throw new AgentRuntimeException(
        "agent_already_registered",
        `Agent already registered: ${id}`,
        id,
      );
    }
    const next = new Map(this.entries);
    next.set(
      id,
      Object.freeze({
        agent,
        executor: options.executor ?? null,
        registeredAt: options.registeredAt,
      }),
    );
    return new AgentRegistry(next);
  }

  unregister(agentId: AgentId): AgentRegistry {
    const id = normalizeAgentId(agentId);
    if (!this.entries.has(id)) {
      return this;
    }
    const next = new Map(this.entries);
    next.delete(id);
    return new AgentRegistry(next);
  }

  lookupById(agentId: AgentId): IAgent | null {
    return this.entries.get(normalizeAgentId(agentId))?.agent ?? null;
  }

  lookupEntry(agentId: AgentId): AgentRegistryEntry | null {
    return this.entries.get(normalizeAgentId(agentId)) ?? null;
  }

  lookupByRole(role: AgentRole): readonly IAgent[] {
    return Object.freeze(
      stableAgentSort(
        [...this.entries.values()]
          .filter((entry) => entry.agent.getRole() === role)
          .map((entry) => entry.agent),
      ),
    );
  }

  lookupByCapability(capability: AgentCapabilityKey): readonly IAgent[] {
    return Object.freeze(
      stableAgentSort(
        [...this.entries.values()]
          .filter((entry) => entry.agent.supports(capability))
          .map((entry) => entry.agent),
      ),
    );
  }

  list(): readonly IAgent[] {
    return Object.freeze(
      stableAgentSort([...this.entries.values()].map((e) => e.agent)),
    );
  }

  listEntries(): readonly AgentRegistryEntry[] {
    return Object.freeze(
      [...this.entries.values()].sort((a, b) =>
        a.agent.id.localeCompare(b.agent.id),
      ),
    );
  }

  has(agentId: AgentId): boolean {
    return this.entries.has(normalizeAgentId(agentId));
  }

  size(): number {
    return this.entries.size;
  }

  /** Snapshot of registered agent ids (immutable). */
  ids(): readonly AgentId[] {
    return Object.freeze(
      [...this.entries.keys()].sort((a, b) => a.localeCompare(b)),
    );
  }

  /** Capability index for integrity checks. */
  capabilityIndex(): ReadonlyMap<AgentCapabilityKey, readonly AgentId[]> {
    const index = new Map<AgentCapabilityKey, AgentId[]>();
    for (const entry of this.entries.values()) {
      for (const key of capabilityKeysOf(entry.agent)) {
        const list = index.get(key) ?? [];
        list.push(entry.agent.id);
        index.set(key, list);
      }
    }
    const frozen = new Map<AgentCapabilityKey, readonly AgentId[]>();
    for (const [key, ids] of index) {
      frozen.set(key, Object.freeze(ids.sort((a, b) => a.localeCompare(b))));
    }
    return frozen;
  }
}

export function createAgentRegistry(
  entries: readonly AgentRegistryEntry[] = [],
): AgentRegistry {
  return entries.length === 0
    ? AgentRegistry.empty()
    : AgentRegistry.fromEntries(entries);
}

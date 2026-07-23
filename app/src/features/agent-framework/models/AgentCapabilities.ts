import type { AgentCapabilityKey } from "./AgentCapabilityKey";
import { ALL_AGENT_CAPABILITY_KEYS } from "./AgentCapabilityKey";

/**
 * Immutable capability flag map for an agent.
 */
export type AgentCapabilities = Readonly<Record<AgentCapabilityKey, boolean>>;

export function createEmptyCapabilities(): AgentCapabilities {
  const flags = {} as Record<AgentCapabilityKey, boolean>;
  for (const key of ALL_AGENT_CAPABILITY_KEYS) {
    flags[key] = false;
  }
  return Object.freeze(flags);
}

export function createCapabilities(
  enabled: readonly AgentCapabilityKey[] = [],
): AgentCapabilities {
  const flags = { ...createEmptyCapabilities() } as Record<
    AgentCapabilityKey,
    boolean
  >;
  for (const key of enabled) {
    flags[key] = true;
  }
  return Object.freeze(flags);
}

export function listEnabledCapabilities(
  capabilities: AgentCapabilities,
): readonly AgentCapabilityKey[] {
  return Object.freeze(
    ALL_AGENT_CAPABILITY_KEYS.filter((key) => capabilities[key]),
  );
}

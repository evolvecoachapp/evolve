import type { AgentCapabilities } from "../models/AgentCapabilities";
import type { AgentCapabilityKey } from "../models/AgentCapabilityKey";
import {
  ALL_AGENT_CAPABILITY_KEYS,
} from "../models/AgentCapabilityKey";
import { listEnabledCapabilities } from "../models/AgentCapabilities";

export function hasCapability(
  capabilities: AgentCapabilities,
  key: AgentCapabilityKey,
): boolean {
  return capabilities[key] === true;
}

export function hasAllCapabilities(
  capabilities: AgentCapabilities,
  keys: readonly AgentCapabilityKey[],
): boolean {
  return keys.every((key) => hasCapability(capabilities, key));
}

export function hasAnyCapability(
  capabilities: AgentCapabilities,
  keys: readonly AgentCapabilityKey[],
): boolean {
  return keys.some((key) => hasCapability(capabilities, key));
}

export function mergeCapabilities(
  base: AgentCapabilities,
  overrides: Partial<AgentCapabilities>,
): AgentCapabilities {
  return Object.freeze({ ...base, ...overrides });
}

export function capabilityCount(capabilities: AgentCapabilities): number {
  return listEnabledCapabilities(capabilities).length;
}

export function isKnownCapabilityKey(key: string): key is AgentCapabilityKey {
  return (ALL_AGENT_CAPABILITY_KEYS as readonly string[]).includes(key);
}

import type { AdapterCapability } from "../contracts/AdapterCapability";
import { isAdapterCapability } from "../contracts/AdapterCapability";

/**
 * Immutable capability set for an infrastructure adapter contract.
 * Capabilities only — no probing, no I/O.
 */
export interface AdapterCapabilities {
  readonly items: readonly AdapterCapability[];
}

export function createAdapterCapabilities(
  items: readonly AdapterCapability[],
): AdapterCapabilities {
  return Object.freeze({
    items: Object.freeze([...items]),
  });
}

export function adapterCapabilitiesInclude(
  capabilities: AdapterCapabilities,
  capability: AdapterCapability,
): boolean {
  return capabilities.items.includes(capability);
}

export function isValidAdapterCapabilities(
  capabilities: AdapterCapabilities,
): boolean {
  if (!capabilities || !Array.isArray(capabilities.items)) {
    return false;
  }
  return capabilities.items.every((item) => isAdapterCapability(item));
}

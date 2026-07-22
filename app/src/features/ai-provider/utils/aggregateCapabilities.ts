import type {
  AIProviderCapabilities,
  AIProviderCapabilityKey,
} from "../models/AIProviderCapabilities";
import {
  ALL_CAPABILITY_KEYS,
  EMPTY_CAPABILITIES,
} from "../models/AIProviderCapabilities";

/**
 * Union (OR) aggregate of capability flags across providers.
 */
export function aggregateCapabilities(
  capabilitiesList: readonly AIProviderCapabilities[],
): AIProviderCapabilities {
  if (capabilitiesList.length === 0) {
    return EMPTY_CAPABILITIES;
  }

  const aggregated = { ...EMPTY_CAPABILITIES } as Record<
    AIProviderCapabilityKey,
    boolean
  >;

  for (const key of ALL_CAPABILITY_KEYS) {
    aggregated[key] = capabilitiesList.some((caps) => caps[key]);
  }

  return Object.freeze(aggregated);
}

/**
 * Intersection (AND) of capability flags across providers.
 */
export function intersectCapabilities(
  capabilitiesList: readonly AIProviderCapabilities[],
): AIProviderCapabilities {
  if (capabilitiesList.length === 0) {
    return EMPTY_CAPABILITIES;
  }

  const aggregated = { ...EMPTY_CAPABILITIES } as Record<
    AIProviderCapabilityKey,
    boolean
  >;

  for (const key of ALL_CAPABILITY_KEYS) {
    aggregated[key] = capabilitiesList.every((caps) => caps[key]);
  }

  return Object.freeze(aggregated);
}

export function listEnabledCapabilities(
  capabilities: AIProviderCapabilities,
): readonly AIProviderCapabilityKey[] {
  return Object.freeze(
    ALL_CAPABILITY_KEYS.filter((key) => capabilities[key]),
  );
}

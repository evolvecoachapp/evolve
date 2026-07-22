import type { AIProviderId } from "./AIProviderId";
import type { AIProviderLimits } from "./AIProviderLimits";
import { UNBOUNDED_LIMITS } from "./AIProviderLimits";
import type { AIProviderMetadata } from "./AIProviderMetadata";
import { EMPTY_PROVIDER_METADATA } from "./AIProviderMetadata";

/**
 * Immutable provider configuration descriptor.
 *
 * No secrets, no endpoints, no HTTP client wiring — abstraction only.
 */
export interface AIProviderConfiguration {
  readonly providerId: AIProviderId;
  readonly displayName: string;
  readonly enabled: boolean;
  readonly defaultModelId: string | null;
  readonly preferredModelIds: readonly string[];
  readonly limits: AIProviderLimits;
  readonly metadata: AIProviderMetadata;
}

export function createDefaultConfiguration(
  providerId: AIProviderId,
  displayName?: string,
): AIProviderConfiguration {
  return Object.freeze({
    providerId,
    displayName: displayName ?? providerId,
    enabled: true,
    defaultModelId: null,
    preferredModelIds: Object.freeze([] as string[]),
    limits: UNBOUNDED_LIMITS,
    metadata: EMPTY_PROVIDER_METADATA,
  });
}

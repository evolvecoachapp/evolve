import type { AIProviderCapabilities } from "./AIProviderCapabilities";
import type { AIProviderId } from "./AIProviderId";
import type { AIProviderLimits } from "./AIProviderLimits";
import type { AIProviderMetadata } from "./AIProviderMetadata";

/**
 * Immutable catalog entry describing a model a provider may expose.
 */
export interface AIModelInfo {
  readonly id: string;
  readonly providerId: AIProviderId;
  readonly displayName: string;
  readonly family: string | null;
  readonly version: string | null;
  readonly capabilities: AIProviderCapabilities;
  readonly limits: AIProviderLimits;
  readonly metadata: AIProviderMetadata;
  readonly available: boolean;
}

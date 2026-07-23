import type { AIProviderId } from "./AIProviderId";
import type { AIProviderCapabilities } from "./AIProviderCapabilities";
import type { AIProviderPricing } from "./AIProviderPricing";
import type { AIProviderStatus } from "./AIProviderStatus";
import type { AIProviderMetadata } from "./AIProviderMetadata";

/**
 * Immutable registry metadata descriptor for a provider.
 *
 * Metadata only — no provider instance, no networking.
 */
export interface ProviderDescriptor {
  readonly id: AIProviderId;
  readonly displayName: string;
  readonly status: AIProviderStatus;
  readonly capabilities: AIProviderCapabilities;
  readonly modelIds: readonly string[];
  readonly pricing: AIProviderPricing | null;
  readonly metadata: AIProviderMetadata;
  readonly isDefault: boolean;
  readonly registeredAt: string;
}

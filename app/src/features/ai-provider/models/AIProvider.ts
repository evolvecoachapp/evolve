import type { AIProviderCapabilities } from "./AIProviderCapabilities";
import type { AIProviderConfiguration } from "./AIProviderConfiguration";
import type { AIProviderHealth } from "./AIProviderHealth";
import type { AIProviderId } from "./AIProviderId";
import type { AIProviderMetadata } from "./AIProviderMetadata";
import type { AIProviderStatus } from "./AIProviderStatus";
import type { AIModelInfo } from "./AIModelInfo";

/**
 * Immutable provider descriptor — registry / engine snapshot.
 *
 * Not an executable provider. Concrete providers implement IAIProvider.
 */
export interface AIProvider {
  readonly id: AIProviderId;
  readonly displayName: string;
  readonly status: AIProviderStatus;
  readonly capabilities: AIProviderCapabilities;
  readonly configuration: AIProviderConfiguration;
  readonly health: AIProviderHealth | null;
  readonly models: readonly AIModelInfo[];
  readonly metadata: AIProviderMetadata;
  readonly registeredAt: string;
}

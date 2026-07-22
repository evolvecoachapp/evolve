import type { AIProviderId } from "./AIProviderId";
import type { AIProviderStatus } from "./AIProviderStatus";

/**
 * Immutable health snapshot for a provider (descriptor only).
 *
 * No live health checks or networking in this foundation sprint.
 */
export interface AIProviderHealth {
  readonly providerId: AIProviderId;
  readonly status: AIProviderStatus;
  readonly healthy: boolean;
  readonly checkedAt: string | null;
  readonly message: string | null;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;
}

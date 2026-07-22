import type { AIProviderId } from "../models/AIProviderId";
import type { IAIProvider } from "./IAIProvider";

/**
 * Provider registry contract.
 *
 * Register / resolve / list / availability validation only.
 * Does not own concrete provider implementations.
 */
export interface IAIProviderRegistry {
  register(provider: IAIProvider): void;
  unregister(providerId: AIProviderId): boolean;
  resolve(providerId: AIProviderId): IAIProvider | null;
  list(): readonly IAIProvider[];
  has(providerId: AIProviderId): boolean;
  isAvailable(providerId: AIProviderId): boolean;
  validateAvailability(providerId: AIProviderId): readonly string[];
  clear(): void;
}

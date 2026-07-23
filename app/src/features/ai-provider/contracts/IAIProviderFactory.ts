import type { AIProviderCapabilityKey } from "../models/AIProviderCapabilities";
import type { AIProviderId } from "../models/AIProviderId";
import type { IAIProvider } from "./IAIProvider";

/**
 * Factory contract — resolve providers by id, model, capability, or default.
 *
 * No concrete vendor providers. Resolves registered contracts only.
 */
export interface IAIProviderFactory {
  resolveById(providerId: AIProviderId): IAIProvider;
  resolveByModel(modelId: string): IAIProvider;
  resolveByCapability(capability: AIProviderCapabilityKey): IAIProvider;
  resolveDefault(): IAIProvider;
  setDefaultProviderId(providerId: AIProviderId): void;
  getDefaultProviderId(): AIProviderId | null;
}

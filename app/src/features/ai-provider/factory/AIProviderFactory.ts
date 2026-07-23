import type { IAIProvider } from "../contracts/IAIProvider";
import type { IAIProviderFactory } from "../contracts/IAIProviderFactory";
import type { IAIProviderRegistry } from "../contracts/IAIProviderRegistry";
import { AIProviderError } from "../models/AIProviderError";
import type { AIProviderCapabilityKey } from "../models/AIProviderCapabilities";
import type { AIProviderId } from "../models/AIProviderId";
import { createAIProviderRegistry } from "../registry/AIProviderRegistry";
import { normalizeProviderId } from "../utils/normalizeProviderId";
import { validateProviderId } from "../validators";

/**
 * Resolves registered provider contracts by id, model, capability, or default.
 *
 * No concrete vendor providers. No networking.
 */
export class AIProviderFactory implements IAIProviderFactory {
  private defaultProviderId: AIProviderId | null = null;

  constructor(private readonly registry: IAIProviderRegistry) {}

  resolveById(providerId: AIProviderId): IAIProvider {
    const idIssues = validateProviderId(providerId);
    if (idIssues.length > 0) {
      throw new AIProviderError(
        "invalid_provider_id",
        `Invalid provider id: ${idIssues.join(", ")}`,
        providerId,
      );
    }

    const normalizedId = normalizeProviderId(providerId);
    const availability = this.registry.validateAvailability(normalizedId);
    if (availability.length > 0) {
      throw new AIProviderError(
        "provider_unavailable",
        `Provider unavailable: ${availability.join(", ")}`,
        normalizedId,
      );
    }

    const provider = this.registry.resolve(normalizedId);
    if (!provider) {
      throw new AIProviderError(
        "provider_not_found",
        `Provider not found: ${normalizedId}`,
        normalizedId,
      );
    }

    return provider;
  }

  resolveByModel(modelId: string): IAIProvider {
    const trimmed = modelId.trim();
    if (!trimmed) {
      throw new AIProviderError(
        "invalid_model_id",
        "Model id is required for factory resolution",
      );
    }

    for (const provider of this.registry.list()) {
      const info = provider.getInfo();
      const match = info.models.find((model) => model.id === trimmed);
      if (match && match.available) {
        return this.resolveById(provider.id);
      }
    }

    throw new AIProviderError(
      "model_not_found",
      `No available provider exposes model: ${trimmed}`,
    );
  }

  resolveByCapability(capability: AIProviderCapabilityKey): IAIProvider {
    for (const provider of this.registry.list()) {
      if (
        provider.supports(capability) &&
        this.registry.isAvailable(provider.id)
      ) {
        return provider;
      }
    }

    throw new AIProviderError(
      "capability_not_found",
      `No available provider supports capability: ${capability}`,
    );
  }

  resolveDefault(): IAIProvider {
    if (this.defaultProviderId) {
      return this.resolveById(this.defaultProviderId);
    }

    const available = this.registry
      .list()
      .find((provider) => this.registry.isAvailable(provider.id));

    if (!available) {
      throw new AIProviderError(
        "no_default_provider",
        "No default provider configured and no available providers registered",
      );
    }

    return available;
  }

  setDefaultProviderId(providerId: AIProviderId): void {
    const normalizedId = normalizeProviderId(providerId);
    if (!this.registry.has(normalizedId)) {
      throw new AIProviderError(
        "provider_not_found",
        `Cannot set default — provider not registered: ${normalizedId}`,
        normalizedId,
      );
    }
    this.defaultProviderId = normalizedId;
  }

  getDefaultProviderId(): AIProviderId | null {
    return this.defaultProviderId;
  }
}

export function createAIProviderFactory(
  registry?: IAIProviderRegistry,
): AIProviderFactory {
  return new AIProviderFactory(registry ?? createAIProviderRegistry());
}

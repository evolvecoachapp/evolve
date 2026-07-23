import type { AIProviderId } from "../models/AIProviderId";
import type { AIProviderLimits } from "../models/AIProviderLimits";
import { UNBOUNDED_LIMITS } from "../models/AIProviderLimits";
import type { AIProviderMetadata } from "../models/AIProviderMetadata";
import { EMPTY_PROVIDER_METADATA } from "../models/AIProviderMetadata";
import type { AIProviderConfiguration } from "../models/AIProviderConfiguration";
import { freezeConfiguration } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable AIProviderConfiguration.
 */
export class ProviderConfigurationBuilder {
  private providerId: AIProviderId = "";
  private displayName = "";
  private enabled = true;
  private defaultModelId: string | null = null;
  private preferredModelIds: readonly string[] = [];
  private limits: AIProviderLimits = UNBOUNDED_LIMITS;
  private metadata: AIProviderMetadata = EMPTY_PROVIDER_METADATA;

  withProviderId(providerId: AIProviderId): this {
    this.providerId = providerId;
    return this;
  }

  withDisplayName(displayName: string): this {
    this.displayName = displayName;
    return this;
  }

  withEnabled(enabled: boolean): this {
    this.enabled = enabled;
    return this;
  }

  withDefaultModelId(defaultModelId: string | null): this {
    this.defaultModelId = defaultModelId;
    return this;
  }

  withPreferredModelIds(preferredModelIds: readonly string[]): this {
    this.preferredModelIds = preferredModelIds;
    return this;
  }

  withLimits(limits: AIProviderLimits): this {
    this.limits = limits;
    return this;
  }

  withMetadata(metadata: AIProviderMetadata): this {
    this.metadata = metadata;
    return this;
  }

  build(): AIProviderConfiguration {
    if (!this.providerId || !this.displayName) {
      throw new Error("ProviderConfigurationBuilder missing required fields");
    }

    return freezeConfiguration({
      providerId: this.providerId,
      displayName: this.displayName,
      enabled: this.enabled,
      defaultModelId: this.defaultModelId,
      preferredModelIds: this.preferredModelIds,
      limits: this.limits,
      metadata: this.metadata,
    });
  }
}

import type { IAIProvider } from "../contracts/IAIProvider";
import type { IAIProviderRegistry } from "../contracts/IAIProviderRegistry";
import type { AIProviderPricing } from "../models/AIProviderPricing";
import { UNKNOWN_PRICING } from "../models/AIProviderPricing";
import type { ProviderDescriptor } from "../models/ProviderDescriptor";
import { EMPTY_PROVIDER_METADATA } from "../models/AIProviderMetadata";
import { createAIProviderRegistry } from "./AIProviderRegistry";
import {
  CapabilityRegistry,
  createCapabilityRegistry,
} from "./CapabilityRegistry";
import { ModelRegistry, createModelRegistry } from "./ModelRegistry";

/**
 * Metadata-oriented provider registry facade.
 *
 * Composes contract registry + capability/model metadata registries.
 * No concrete providers. No networking.
 */
export class ProviderRegistry {
  private readonly descriptors = new Map<string, ProviderDescriptor>();
  private defaultProviderId: string | null = null;

  constructor(
    private readonly providers: IAIProviderRegistry = createAIProviderRegistry(),
    private readonly capabilities: CapabilityRegistry = createCapabilityRegistry(),
    private readonly models: ModelRegistry = createModelRegistry(),
  ) {}

  getProviderRegistry(): IAIProviderRegistry {
    return this.providers;
  }

  getCapabilityRegistry(): CapabilityRegistry {
    return this.capabilities;
  }

  getModelRegistry(): ModelRegistry {
    return this.models;
  }

  register(
    provider: IAIProvider,
    options: {
      readonly pricing?: AIProviderPricing | null;
      readonly isDefault?: boolean;
    } = {},
  ): ProviderDescriptor {
    this.providers.register(provider);
    const info = provider.getInfo();
    const descriptor: ProviderDescriptor = Object.freeze({
      id: info.id,
      displayName: info.displayName,
      status: info.status,
      capabilities: info.capabilities,
      modelIds: Object.freeze(info.models.map((model) => model.id)),
      pricing: options.pricing ?? UNKNOWN_PRICING,
      metadata: info.metadata ?? EMPTY_PROVIDER_METADATA,
      isDefault: options.isDefault ?? false,
      registeredAt: info.registeredAt,
    });

    this.descriptors.set(info.id, descriptor);
    this.capabilities.register(descriptor);
    for (const model of info.models) {
      if (!this.models.resolve(model.providerId, model.id)) {
        this.models.register(model);
      }
    }

    if (options.isDefault || this.defaultProviderId === null) {
      this.defaultProviderId = info.id;
    }

    return descriptor;
  }

  describe(providerId: string): ProviderDescriptor | null {
    return this.descriptors.get(providerId) ?? null;
  }

  listDescriptors(): readonly ProviderDescriptor[] {
    return Object.freeze([...this.descriptors.values()]);
  }

  getDefaultProviderId(): string | null {
    return this.defaultProviderId;
  }

  setDefaultProviderId(providerId: string): void {
    if (!this.descriptors.has(providerId)) {
      throw new Error(`Provider descriptor not found: ${providerId}`);
    }
    this.defaultProviderId = providerId;
    const next = new Map<string, ProviderDescriptor>();
    for (const [id, descriptor] of this.descriptors) {
      next.set(
        id,
        Object.freeze({
          ...descriptor,
          isDefault: id === providerId,
        }),
      );
    }
    this.descriptors.clear();
    for (const [id, descriptor] of next) {
      this.descriptors.set(id, descriptor);
    }
  }

  clear(): void {
    this.providers.clear();
    this.capabilities.clear();
    this.models.clear();
    this.descriptors.clear();
    this.defaultProviderId = null;
  }
}

export function createProviderRegistry(
  providers?: IAIProviderRegistry,
  capabilities?: CapabilityRegistry,
  models?: ModelRegistry,
): ProviderRegistry {
  return new ProviderRegistry(providers, capabilities, models);
}

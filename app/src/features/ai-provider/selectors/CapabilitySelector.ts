import type { IAIProvider } from "../contracts/IAIProvider";
import type { IAIProviderRegistry } from "../contracts/IAIProviderRegistry";
import type { AIProviderCapabilityKey } from "../models/AIProviderCapabilities";
import type { CapabilityRegistry } from "../registry/CapabilityRegistry";

/**
 * Select providers / provider ids by capability.
 */
export class CapabilitySelector {
  constructor(
    private readonly registry: IAIProviderRegistry,
    private readonly capabilityRegistry?: CapabilityRegistry,
  ) {}

  providersSupporting(
    capability: AIProviderCapabilityKey,
  ): readonly IAIProvider[] {
    return Object.freeze(
      this.registry
        .list()
        .filter(
          (provider) =>
            provider.supports(capability) &&
            this.registry.isAvailable(provider.id),
        ),
    );
  }

  providerIdsSupporting(
    capability: AIProviderCapabilityKey,
  ): readonly string[] {
    if (this.capabilityRegistry) {
      return this.capabilityRegistry.listProviders(capability);
    }
    return Object.freeze(
      this.providersSupporting(capability).map((provider) => provider.id),
    );
  }

  firstSupporting(
    capability: AIProviderCapabilityKey,
  ): IAIProvider | null {
    return this.providersSupporting(capability)[0] ?? null;
  }
}

export function createCapabilitySelector(
  registry: IAIProviderRegistry,
  capabilityRegistry?: CapabilityRegistry,
): CapabilitySelector {
  return new CapabilitySelector(registry, capabilityRegistry);
}

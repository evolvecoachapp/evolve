import type { IAIProvider } from "../contracts/IAIProvider";
import type { IAIProviderRegistry } from "../contracts/IAIProviderRegistry";
import type { AIProviderId } from "../models/AIProviderId";
import type { ProviderDescriptor } from "../models/ProviderDescriptor";
import type { ProviderRegistry } from "../registry/ProviderRegistry";
import { isAvailableStatus } from "../models/AIProviderStatus";

/**
 * Select providers from registry / descriptor metadata.
 */
export class ProviderSelector {
  constructor(
    private readonly registry: IAIProviderRegistry,
    private readonly providerRegistry?: ProviderRegistry,
  ) {}

  byId(providerId: AIProviderId): IAIProvider | null {
    return this.registry.resolve(providerId);
  }

  available(): readonly IAIProvider[] {
    return Object.freeze(
      this.registry.list().filter((provider) =>
        this.registry.isAvailable(provider.id),
      ),
    );
  }

  byStatus(
    status: ReturnType<IAIProvider["getStatus"]>,
  ): readonly IAIProvider[] {
    return Object.freeze(
      this.registry.list().filter((provider) => provider.getStatus() === status),
    );
  }

  defaultDescriptor(): ProviderDescriptor | null {
    if (!this.providerRegistry) {
      return null;
    }
    const defaultId = this.providerRegistry.getDefaultProviderId();
    return defaultId ? this.providerRegistry.describe(defaultId) : null;
  }

  descriptorsAvailable(): readonly ProviderDescriptor[] {
    if (!this.providerRegistry) {
      return Object.freeze([]);
    }
    return Object.freeze(
      this.providerRegistry
        .listDescriptors()
        .filter((descriptor) => isAvailableStatus(descriptor.status)),
    );
  }
}

export function createProviderSelector(
  registry: IAIProviderRegistry,
  providerRegistry?: ProviderRegistry,
): ProviderSelector {
  return new ProviderSelector(registry, providerRegistry);
}

import type { AIProviderPricing } from "../models/AIProviderPricing";
import { UNKNOWN_PRICING } from "../models/AIProviderPricing";
import type { ProviderDescriptor } from "../models/ProviderDescriptor";
import type { ProviderRegistry } from "../registry/ProviderRegistry";

/**
 * Select pricing metadata from provider descriptors.
 */
export class PricingSelector {
  constructor(private readonly providerRegistry: ProviderRegistry) {}

  forProvider(providerId: string): AIProviderPricing {
    const descriptor = this.providerRegistry.describe(providerId);
    return descriptor?.pricing ?? UNKNOWN_PRICING;
  }

  withKnownPricing(): readonly ProviderDescriptor[] {
    return Object.freeze(
      this.providerRegistry.listDescriptors().filter((descriptor) => {
        const pricing = descriptor.pricing;
        if (!pricing) {
          return false;
        }
        return (
          pricing.inputCostPer1KTokens != null ||
          pricing.outputCostPer1KTokens != null ||
          pricing.flatRequestCost != null
        );
      }),
    );
  }
}

export function createPricingSelector(
  providerRegistry: ProviderRegistry,
): PricingSelector {
  return new PricingSelector(providerRegistry);
}

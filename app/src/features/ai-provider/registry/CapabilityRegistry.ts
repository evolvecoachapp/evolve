import type { AIProviderCapabilityKey } from "../models/AIProviderCapabilities";
import type { AIProviderCapabilities } from "../models/AIProviderCapabilities";
import { ALL_CAPABILITY_KEYS } from "../models/AIProviderCapabilities";
import type { ProviderDescriptor } from "../models/ProviderDescriptor";

/**
 * Metadata-only capability registry.
 * Tracks which capabilities are declared across provider descriptors.
 */
export class CapabilityRegistry {
  private readonly byCapability = new Map<
    AIProviderCapabilityKey,
    Set<string>
  >();

  register(descriptor: ProviderDescriptor): void {
    for (const key of ALL_CAPABILITY_KEYS) {
      if (descriptor.capabilities[key]) {
        const set = this.byCapability.get(key) ?? new Set<string>();
        set.add(descriptor.id);
        this.byCapability.set(key, set);
      }
    }
  }

  unregister(providerId: string): void {
    for (const set of this.byCapability.values()) {
      set.delete(providerId);
    }
  }

  listProviders(capability: AIProviderCapabilityKey): readonly string[] {
    const set = this.byCapability.get(capability);
    return Object.freeze(set ? [...set] : []);
  }

  hasCapability(
    providerId: string,
    capability: AIProviderCapabilityKey,
  ): boolean {
    return this.byCapability.get(capability)?.has(providerId) ?? false;
  }

  aggregate(): AIProviderCapabilities {
    const result = {} as Record<AIProviderCapabilityKey, boolean>;
    for (const key of ALL_CAPABILITY_KEYS) {
      result[key] = (this.byCapability.get(key)?.size ?? 0) > 0;
    }
    return Object.freeze(result) as AIProviderCapabilities;
  }

  clear(): void {
    this.byCapability.clear();
  }
}

export function createCapabilityRegistry(): CapabilityRegistry {
  return new CapabilityRegistry();
}

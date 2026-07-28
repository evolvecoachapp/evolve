import type { SynchronizationProviderToken } from "./SynchronizationProviderToken";
import type { SynchronizationProviderMetadata } from "./SynchronizationProviderMetadata";
import { createSynchronizationProviderMetadata } from "./SynchronizationProviderMetadata";

/**
 * Immutable descriptor for a registered synchronization provider.
 */
export interface SynchronizationProviderRegistration {
  readonly token: SynchronizationProviderToken;
  readonly name: string;
  readonly version: string;
  readonly providerId: SynchronizationProviderToken;
  readonly metadata: SynchronizationProviderMetadata;
}

export function createSynchronizationProviderRegistration(input: {
  readonly token: SynchronizationProviderToken;
  readonly name: string;
  readonly version: string;
  readonly providerId: SynchronizationProviderToken;
  readonly metadata?: Readonly<Record<string, string>>;
}): SynchronizationProviderRegistration {
  return Object.freeze({
    token: input.token,
    name: input.name,
    version: input.version,
    providerId: input.providerId,
    metadata: createSynchronizationProviderMetadata(input.metadata ?? {}),
  });
}

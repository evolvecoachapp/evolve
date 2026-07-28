/**
 * Immutable metadata for a registered synchronization provider.
 */
export type SynchronizationProviderMetadata = Readonly<Record<string, string>>;

export function createSynchronizationProviderMetadata(
  attributes: Readonly<Record<string, string>>,
): SynchronizationProviderMetadata {
  return Object.freeze({ ...attributes });
}

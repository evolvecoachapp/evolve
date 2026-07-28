/**
 * Canonical synchronization provider tokens.
 * Future providers (supabase, postgresql, firebase, custom)
 * register under additional tokens without changing Domain.
 */
export const SYNCHRONIZATION_PROVIDER_TOKENS = ["local"] as const;

export type SynchronizationProviderToken =
  (typeof SYNCHRONIZATION_PROVIDER_TOKENS)[number];

export function isSynchronizationProviderToken(
  value: string,
): value is SynchronizationProviderToken {
  return (SYNCHRONIZATION_PROVIDER_TOKENS as readonly string[]).includes(value);
}

/**
 * Canonical backend provider tokens.
 * Future providers (fastapi, aspnet, nestjs, go, rust, graphql, rest)
 * register under additional tokens without changing Domain.
 */
export const BACKEND_PROVIDER_TOKENS = ["mock"] as const;

export type BackendProviderToken = (typeof BACKEND_PROVIDER_TOKENS)[number];

export function isBackendProviderToken(
  value: string,
): value is BackendProviderToken {
  return (BACKEND_PROVIDER_TOKENS as readonly string[]).includes(value);
}

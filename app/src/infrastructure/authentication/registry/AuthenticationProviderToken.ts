/**
 * Canonical authentication provider tokens.
 * Future providers (supabase, firebase, auth0, apple, google, microsoft)
 * register under additional tokens without changing Domain.
 */
export const AUTHENTICATION_PROVIDER_TOKENS = ["mock"] as const;

export type AuthenticationProviderToken =
  (typeof AUTHENTICATION_PROVIDER_TOKENS)[number];

export function isAuthenticationProviderToken(
  value: string,
): value is AuthenticationProviderToken {
  return (AUTHENTICATION_PROVIDER_TOKENS as readonly string[]).includes(value);
}

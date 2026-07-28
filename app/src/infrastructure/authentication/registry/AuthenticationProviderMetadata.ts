/**
 * Immutable metadata for a registered authentication provider.
 */
export type AuthenticationProviderMetadata = Readonly<Record<string, string>>;

export function createAuthenticationProviderMetadata(
  attributes: Readonly<Record<string, string>>,
): AuthenticationProviderMetadata {
  return Object.freeze({ ...attributes });
}

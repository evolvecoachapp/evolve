/**
 * Immutable metadata for authentication entities.
 */
export type AuthenticationMetadata = Readonly<Record<string, string>>;

export function createAuthenticationMetadata(
  attributes: Readonly<Record<string, string>> = {},
): AuthenticationMetadata {
  return Object.freeze({ ...attributes });
}

import type { AuthenticationProviderToken } from "./AuthenticationProviderToken";
import type { AuthenticationProviderMetadata } from "./AuthenticationProviderMetadata";
import { createAuthenticationProviderMetadata } from "./AuthenticationProviderMetadata";

/**
 * Immutable descriptor for a registered authentication provider.
 */
export interface AuthenticationProviderRegistration {
  readonly token: AuthenticationProviderToken;
  readonly name: string;
  readonly version: string;
  readonly providerId: AuthenticationProviderToken;
  readonly metadata: AuthenticationProviderMetadata;
}

export function createAuthenticationProviderRegistration(input: {
  readonly token: AuthenticationProviderToken;
  readonly name: string;
  readonly version: string;
  readonly providerId: AuthenticationProviderToken;
  readonly metadata?: Readonly<Record<string, string>>;
}): AuthenticationProviderRegistration {
  return Object.freeze({
    token: input.token,
    name: input.name,
    version: input.version,
    providerId: input.providerId,
    metadata: createAuthenticationProviderMetadata(input.metadata ?? {}),
  });
}

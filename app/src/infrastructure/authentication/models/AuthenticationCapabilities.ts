/**
 * Immutable authentication capability descriptors.
 * Capabilities only — no runtime probing, no I/O.
 */
export interface AuthenticationCapabilities {
  readonly supportsSignIn: boolean;
  readonly supportsSignOut: boolean;
  readonly supportsRefresh: boolean;
  readonly supportsOffline: boolean;
  readonly supportsBiometrics: boolean;
}

export function createAuthenticationCapabilities(
  input: Partial<AuthenticationCapabilities> = {},
): AuthenticationCapabilities {
  return Object.freeze({
    supportsSignIn: input.supportsSignIn ?? true,
    supportsSignOut: input.supportsSignOut ?? true,
    supportsRefresh: input.supportsRefresh ?? true,
    supportsOffline: input.supportsOffline ?? true,
    supportsBiometrics: input.supportsBiometrics ?? false,
  });
}

export const MOCK_AUTHENTICATION_CAPABILITIES =
  createAuthenticationCapabilities({
    supportsSignIn: true,
    supportsSignOut: true,
    supportsRefresh: true,
    supportsOffline: true,
    supportsBiometrics: false,
  });

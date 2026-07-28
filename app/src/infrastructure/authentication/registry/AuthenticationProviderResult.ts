/**
 * Immutable result envelope for authentication provider registry operations.
 */
export interface AuthenticationProviderResult<T = unknown> {
  readonly success: boolean;
  readonly value: T | null;
  readonly errorCode: string | null;
  readonly message: string | null;
}

export function createAuthenticationProviderResult<T>(input: {
  readonly success: boolean;
  readonly value?: T | null;
  readonly errorCode?: string | null;
  readonly message?: string | null;
}): AuthenticationProviderResult<T> {
  return Object.freeze({
    success: input.success,
    value: (input.value ?? null) as T | null,
    errorCode: input.errorCode ?? null,
    message: input.message ?? null,
  });
}

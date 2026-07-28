/**
 * Immutable result envelope for authentication operations.
 */
export interface AuthenticationResult<T = unknown> {
  readonly success: boolean;
  readonly value: T | null;
  readonly errorCode: string | null;
  readonly message: string | null;
}

export function createAuthenticationResult<T>(input: {
  readonly success: boolean;
  readonly value?: T | null;
  readonly errorCode?: string | null;
  readonly message?: string | null;
}): AuthenticationResult<T> {
  return Object.freeze({
    success: input.success,
    value: (input.value ?? null) as T | null,
    errorCode: input.errorCode ?? null,
    message: input.message ?? null,
  });
}

export interface AuthenticationValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function createAuthenticationValidation(
  errors: readonly string[],
): AuthenticationValidation {
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze([...errors]),
  });
}

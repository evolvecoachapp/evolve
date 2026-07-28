/**
 * Immutable result envelope for logging operations.
 */
export interface LogResult<T = unknown> {
  readonly success: boolean;
  readonly value: T | null;
  readonly errorCode: string | null;
  readonly message: string | null;
}

export function createLogResult<T>(input: {
  readonly success: boolean;
  readonly value?: T | null;
  readonly errorCode?: string | null;
  readonly message?: string | null;
}): LogResult<T> {
  return Object.freeze({
    success: input.success,
    value: (input.value ?? null) as T | null,
    errorCode: input.errorCode ?? null,
    message: input.message ?? null,
  });
}

export interface LogValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function createLogValidation(
  errors: readonly string[],
): LogValidation {
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze([...errors]),
  });
}

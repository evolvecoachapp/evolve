/**
 * Immutable result envelope for synchronization operations.
 */
export interface SynchronizationResult<T = unknown> {
  readonly success: boolean;
  readonly value: T | null;
  readonly errorCode: string | null;
  readonly message: string | null;
}

export function createSynchronizationResult<T>(input: {
  readonly success: boolean;
  readonly value?: T | null;
  readonly errorCode?: string | null;
  readonly message?: string | null;
}): SynchronizationResult<T> {
  return Object.freeze({
    success: input.success,
    value: (input.value ?? null) as T | null,
    errorCode: input.errorCode ?? null,
    message: input.message ?? null,
  });
}

export interface SynchronizationValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function createSynchronizationValidation(
  errors: readonly string[],
): SynchronizationValidation {
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze([...errors]),
  });
}

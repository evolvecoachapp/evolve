/**
 * Immutable result envelope for infrastructure adapter operations.
 * Contract type only — no I/O.
 */
export interface AdapterResult<T = unknown> {
  readonly success: boolean;
  readonly value: T | null;
  readonly errorCode: string | null;
  readonly message: string | null;
}

export function createAdapterResult<T>(input: {
  readonly success: boolean;
  readonly value?: T | null;
  readonly errorCode?: string | null;
  readonly message?: string | null;
}): AdapterResult<T> {
  return Object.freeze({
    success: input.success,
    value: (input.value ?? null) as T | null,
    errorCode: input.errorCode ?? null,
    message: input.message ?? null,
  });
}

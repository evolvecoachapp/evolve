/**
 * Immutable result envelope for storage port operations.
 * Contract type only — no I/O.
 */
export interface StorageResult<T = unknown> {
  readonly success: boolean;
  readonly value: T | null;
  readonly errorCode: string | null;
  readonly message: string | null;
}

export function createStorageResult<T>(
  input: {
    readonly success: boolean;
    readonly value?: T | null;
    readonly errorCode?: string | null;
    readonly message?: string | null;
  },
): StorageResult<T> {
  return Object.freeze({
    success: input.success,
    value: (input.value ?? null) as T | null,
    errorCode: input.errorCode ?? null,
    message: input.message ?? null,
  });
}

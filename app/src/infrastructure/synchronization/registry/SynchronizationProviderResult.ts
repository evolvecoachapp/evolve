/**
 * Immutable result envelope for synchronization provider registry operations.
 */
export interface SynchronizationProviderResult<T = unknown> {
  readonly success: boolean;
  readonly value: T | null;
  readonly errorCode: string | null;
  readonly message: string | null;
}

export function createSynchronizationProviderResult<T>(input: {
  readonly success: boolean;
  readonly value?: T | null;
  readonly errorCode?: string | null;
  readonly message?: string | null;
}): SynchronizationProviderResult<T> {
  return Object.freeze({
    success: input.success,
    value: (input.value ?? null) as T | null,
    errorCode: input.errorCode ?? null,
    message: input.message ?? null,
  });
}

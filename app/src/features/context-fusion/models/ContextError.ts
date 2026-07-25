/**
 * Immutable fusion error.
 */
export interface ContextError {
  readonly code: string;
  readonly message: string;
  readonly path: string | null;
}

export function createContextError(input: {
  readonly code: string;
  readonly message: string;
  readonly path?: string | null;
}): ContextError {
  return Object.freeze({
    code: input.code,
    message: input.message,
    path: input.path ?? null,
  });
}

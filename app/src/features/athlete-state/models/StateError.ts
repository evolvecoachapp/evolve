export interface StateError {
  readonly code: string;
  readonly message: string;
  readonly path: string | null;
}

export function createStateError(input: {
  readonly code: string;
  readonly message: string;
  readonly path?: string | null;
}): StateError {
  return Object.freeze({
    code: input.code,
    message: input.message,
    path: input.path ?? null,
  });
}

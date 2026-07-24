export interface SessionError {
  readonly code: string;
  readonly message: string;
  readonly path: string | null;
}

export function createSessionError(input: {
  readonly code: string;
  readonly message: string;
  readonly path?: string | null;
}): SessionError {
  return Object.freeze({
    code: input.code,
    message: input.message,
    path: input.path ?? null,
  });
}

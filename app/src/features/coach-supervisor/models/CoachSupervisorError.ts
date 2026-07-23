export interface CoachSupervisorError {
  readonly code: string;
  readonly message: string;
  readonly path: string | null;
}

export function createSupervisorError(input: {
  readonly code: string;
  readonly message: string;
  readonly path?: string | null;
}): CoachSupervisorError {
  return Object.freeze({
    code: input.code,
    message: input.message,
    path: input.path ?? null,
  });
}

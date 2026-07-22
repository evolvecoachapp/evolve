/**
 * Domain error for programming failures.
 */
export class ProgrammingError extends Error {
  readonly code: string;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(
    code: string,
    message: string,
    details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "ProgrammingError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

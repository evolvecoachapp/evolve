/**
 * Domain error for progression failures.
 */
export class ProgressionError extends Error {
  readonly code: string;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(
    code: string,
    message: string,
    details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "ProgressionError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

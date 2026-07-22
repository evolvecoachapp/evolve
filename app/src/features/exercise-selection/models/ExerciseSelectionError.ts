/**
 * Domain error for exercise selection failures.
 */
export class ExerciseSelectionError extends Error {
  readonly code: string;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(
    code: string,
    message: string,
    details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "ExerciseSelectionError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

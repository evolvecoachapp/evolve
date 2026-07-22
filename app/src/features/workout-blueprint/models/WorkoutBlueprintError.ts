/**
 * Domain error for workout-blueprint failures.
 */
export class WorkoutBlueprintError extends Error {
  readonly code: string;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(
    code: string,
    message: string,
    details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "WorkoutBlueprintError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

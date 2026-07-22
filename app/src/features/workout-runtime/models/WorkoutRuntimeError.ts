/**
 * Domain error for invalid workout runtime operations.
 */
export class WorkoutRuntimeError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "WorkoutRuntimeError";
    this.code = code;
  }
}

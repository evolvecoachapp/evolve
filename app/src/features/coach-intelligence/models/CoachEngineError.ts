/**
 * Typed error for coach intelligence hard failures (missing required inputs).
 */
export class CoachEngineError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "CoachEngineError";
    this.code = code;
  }
}

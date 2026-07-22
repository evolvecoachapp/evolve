/**
 * Typed error for insight engine hard failures (missing required inputs).
 */
export class InsightEngineError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "InsightEngineError";
    this.code = code;
  }
}

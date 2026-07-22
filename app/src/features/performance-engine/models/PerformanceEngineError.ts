/**
 * Typed error for Performance Engine validation / analysis failures.
 */
export class PerformanceEngineError extends Error {
  readonly code: string;
  readonly details: readonly string[];

  constructor(code: string, message: string, details: readonly string[] = []) {
    super(message);
    this.name = "PerformanceEngineError";
    this.code = code;
    this.details = details;
  }
}

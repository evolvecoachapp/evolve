/**
 * Domain error for Athlete History Engine failures.
 */
export class HistoryEngineError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "HistoryEngineError";
    this.code = code;
  }
}

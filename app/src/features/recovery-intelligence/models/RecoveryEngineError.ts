/**
 * Typed error for recovery engine hard failures (missing required inputs).
 */
export class RecoveryEngineError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "RecoveryEngineError";
    this.code = code;
  }
}

/**
 * Domain error for invalid rest runtime operations.
 */
export class RestRuntimeError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "RestRuntimeError";
    this.code = code;
  }
}

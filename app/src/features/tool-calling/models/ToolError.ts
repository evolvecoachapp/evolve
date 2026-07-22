/**
 * Domain error for tool-calling failures.
 */
export class ToolError extends Error {
  readonly code: string;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(
    code: string,
    message: string,
    details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "ToolError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

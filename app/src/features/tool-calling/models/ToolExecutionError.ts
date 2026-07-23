/**
 * Immutable tool execution error snapshot.
 *
 * Distinct from the legacy throwable `ToolError` class.
 */
export interface ToolExecutionError {
  readonly code: string;
  readonly message: string;
  readonly details: Readonly<Record<string, unknown>>;
}

export function createToolExecutionError(
  code: string,
  message: string,
  details: Readonly<Record<string, unknown>> = {},
): ToolExecutionError {
  return Object.freeze({
    code,
    message,
    details: Object.freeze({ ...details }),
  });
}

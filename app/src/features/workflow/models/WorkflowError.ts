/**
 * Domain error for workflow-engine failures.
 */
export class WorkflowError extends Error {
  readonly code: string;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(
    code: string,
    message: string,
    details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "WorkflowError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

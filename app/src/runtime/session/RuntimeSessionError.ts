export type RuntimeSessionErrorCode =
  | "session_already_started"
  | "bootstrap_failed"
  | "hydration_failed"
  | "restore_failed"
  | "invalid_session_state";

export class RuntimeSessionError extends Error {
  constructor(
    message: string,
    readonly code: RuntimeSessionErrorCode,
  ) {
    super(message);
    this.name = "RuntimeSessionError";
  }
}

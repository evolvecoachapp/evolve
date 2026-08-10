export type RecoveryProgressValidationCode =
  | "missing_event"
  | "duplicate_event_id"
  | "invalid_payload"
  | "missing_metadata"
  | "unsupported_event_type";

export class RecoveryProgressValidationError extends Error {
  constructor(
    message: string,
    readonly code: RecoveryProgressValidationCode,
  ) {
    super(message);
    this.name = "RecoveryProgressValidationError";
  }
}

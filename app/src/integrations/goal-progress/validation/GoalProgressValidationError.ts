export type GoalProgressValidationCode =
  | "missing_event"
  | "duplicate_event_id"
  | "invalid_payload"
  | "missing_metadata"
  | "unsupported_event_type";

export class GoalProgressValidationError extends Error {
  constructor(
    message: string,
    readonly code: GoalProgressValidationCode,
  ) {
    super(message);
    this.name = "GoalProgressValidationError";
  }
}

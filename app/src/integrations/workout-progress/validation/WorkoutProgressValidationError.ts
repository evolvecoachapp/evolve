export type WorkoutProgressValidationCode =
  | "missing_event"
  | "duplicate_event_id"
  | "invalid_payload"
  | "missing_metadata"
  | "unsupported_event_type";

export class WorkoutProgressValidationError extends Error {
  constructor(
    message: string,
    readonly code: WorkoutProgressValidationCode,
  ) {
    super(message);
    this.name = "WorkoutProgressValidationError";
  }
}

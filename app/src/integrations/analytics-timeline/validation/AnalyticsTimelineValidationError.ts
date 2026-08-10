export type AnalyticsTimelineValidationCode =
  | "missing_event"
  | "duplicate_event_id"
  | "invalid_payload"
  | "missing_metadata"
  | "unsupported_event_type"
  | "missing_athlete_id";

export class AnalyticsTimelineValidationError extends Error {
  constructor(
    message: string,
    readonly code: AnalyticsTimelineValidationCode,
  ) {
    super(message);
    this.name = "AnalyticsTimelineValidationError";
  }
}

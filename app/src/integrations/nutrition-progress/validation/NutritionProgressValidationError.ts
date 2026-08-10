export type NutritionProgressValidationCode =
  | "missing_event"
  | "duplicate_event_id"
  | "invalid_payload"
  | "missing_metadata"
  | "unsupported_event_type";

export class NutritionProgressValidationError extends Error {
  constructor(
    message: string,
    readonly code: NutritionProgressValidationCode,
  ) {
    super(message);
    this.name = "NutritionProgressValidationError";
  }
}

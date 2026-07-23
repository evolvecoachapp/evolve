/**
 * Immutable validation issue for coach response integrity checks.
 */
export interface CoachValidationIssue {
  readonly code: CoachValidationCode;
  readonly message: string;
  readonly path: string | null;
}

export type CoachValidationCode =
  | "missing_id"
  | "missing_message"
  | "empty_message"
  | "invalid_confidence"
  | "invalid_recommendation"
  | "invalid_action"
  | "invalid_metadata"
  | "invalid_section"
  | "incomplete_response"
  | "formatting_integrity";

export const CoachValidationCodes = Object.freeze({
  MISSING_ID: "missing_id" as const,
  MISSING_MESSAGE: "missing_message" as const,
  EMPTY_MESSAGE: "empty_message" as const,
  INVALID_CONFIDENCE: "invalid_confidence" as const,
  INVALID_RECOMMENDATION: "invalid_recommendation" as const,
  INVALID_ACTION: "invalid_action" as const,
  INVALID_METADATA: "invalid_metadata" as const,
  INVALID_SECTION: "invalid_section" as const,
  INCOMPLETE_RESPONSE: "incomplete_response" as const,
  FORMATTING_INTEGRITY: "formatting_integrity" as const,
});

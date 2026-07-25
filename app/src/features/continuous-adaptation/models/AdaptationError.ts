export const AdaptationErrorCodes = {
  MISSING_INPUT: "missing_input",
  MISSING_ATHLETE: "missing_athlete",
  INVALID_INPUT: "invalid_input",
  VALIDATION_FAILED: "validation_failed",
  POLICY_BLOCKED: "policy_blocked",
  INCONSISTENT_TRIGGER: "inconsistent_trigger",
  INCONSISTENT_TIMELINE: "inconsistent_timeline",
} as const;

export type AdaptationErrorCode =
  (typeof AdaptationErrorCodes)[keyof typeof AdaptationErrorCodes];

export interface AdaptationError {
  readonly code: AdaptationErrorCode;
  readonly message: string;
  readonly subjectId: string | null;
}

export function createAdaptationError(
  code: AdaptationErrorCode,
  message: string,
  subjectId: string | null = null,
): AdaptationError {
  return Object.freeze({ code, message, subjectId });
}

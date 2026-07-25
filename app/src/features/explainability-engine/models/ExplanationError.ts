export const ExplanationErrorCodes = {
  MISSING_INPUT: "missing_input",
  MISSING_DECISIONS: "missing_decisions",
  MISSING_RECOMMENDATIONS: "missing_recommendations",
  INVALID_INPUT: "invalid_input",
  VALIDATION_FAILED: "validation_failed",
  POLICY_BLOCKED: "policy_blocked",
} as const;

export type ExplanationErrorCode =
  (typeof ExplanationErrorCodes)[keyof typeof ExplanationErrorCodes];

export interface ExplanationError {
  readonly code: ExplanationErrorCode;
  readonly message: string;
  readonly subjectId: string | null;
}

export function createExplanationError(
  code: ExplanationErrorCode,
  message: string,
  subjectId: string | null = null,
): ExplanationError {
  return Object.freeze({ code, message, subjectId });
}

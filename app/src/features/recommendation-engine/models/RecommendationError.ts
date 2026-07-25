export const RecommendationErrorCodes = {
  MISSING_CONTEXT: "missing_context",
  MISSING_DECISIONS: "missing_decisions",
  VALIDATION_FAILED: "validation_failed",
  CONFLICT_UNRESOLVED: "conflict_unresolved",
  INVALID_INPUT: "invalid_input",
} as const;

export type RecommendationErrorCode =
  (typeof RecommendationErrorCodes)[keyof typeof RecommendationErrorCodes];

export interface RecommendationError {
  readonly code: RecommendationErrorCode;
  readonly message: string;
  readonly subjectId: string | null;
}

export function createRecommendationError(
  code: RecommendationErrorCode,
  message: string,
  subjectId: string | null = null,
): RecommendationError {
  return Object.freeze({ code, message, subjectId });
}

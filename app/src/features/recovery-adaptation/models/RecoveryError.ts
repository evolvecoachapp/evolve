export const RecoveryErrorCodes = {
  MISSING_INPUT: "missing_input",
  MISSING_ATHLETE: "missing_athlete",
  MISSING_PLAN: "missing_plan",
  INVALID_INPUT: "invalid_input",
  VALIDATION_FAILED: "validation_failed",
  POLICY_BLOCKED: "policy_blocked",
  EMPTY_PLAN: "empty_plan",
  INCONSISTENT_MEAL: "inconsistent_day",
  INCONSISTENT_MACRO: "inconsistent_protocol",
  INCONSISTENT_WEEK: "inconsistent_week",
} as const;

export type RecoveryErrorCode =
  (typeof RecoveryErrorCodes)[keyof typeof RecoveryErrorCodes];

export interface RecoveryError {
  readonly code: RecoveryErrorCode;
  readonly message: string;
  readonly subjectId: string | null;
}

export function createRecoveryError(
  code: RecoveryErrorCode,
  message: string,
  subjectId: string | null = null,
): RecoveryError {
  return Object.freeze({ code, message, subjectId });
}

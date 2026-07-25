export const GoalErrorCodes = {
  MISSING_INPUT: "missing_input",
  MISSING_ATHLETE: "missing_athlete",
  INVALID_INPUT: "invalid_input",
  VALIDATION_FAILED: "validation_failed",
  POLICY_BLOCKED: "policy_blocked",
  INCONSISTENT_TRIGGER: "inconsistent_trigger",
  INCONSISTENT_TIMELINE: "inconsistent_timeline",
} as const;

export type GoalErrorCode =
  (typeof GoalErrorCodes)[keyof typeof GoalErrorCodes];

export interface GoalError {
  readonly code: GoalErrorCode;
  readonly message: string;
  readonly subjectId: string | null;
}

export function createGoalError(
  code: GoalErrorCode,
  message: string,
  subjectId: string | null = null,
): GoalError {
  return Object.freeze({ code, message, subjectId });
}

export const WorkoutErrorCodes = {
  MISSING_INPUT: "missing_input",
  MISSING_ATHLETE: "missing_athlete",
  MISSING_BLUEPRINT: "missing_blueprint",
  INVALID_INPUT: "invalid_input",
  VALIDATION_FAILED: "validation_failed",
  POLICY_BLOCKED: "policy_blocked",
  EMPTY_BLUEPRINT: "empty_blueprint",
  INCONSISTENT_EXERCISE: "inconsistent_exercise",
  INCONSISTENT_WEEK: "inconsistent_week",
} as const;

export type WorkoutErrorCode =
  (typeof WorkoutErrorCodes)[keyof typeof WorkoutErrorCodes];

export interface WorkoutError {
  readonly code: WorkoutErrorCode;
  readonly message: string;
  readonly subjectId: string | null;
}

export function createWorkoutError(
  code: WorkoutErrorCode,
  message: string,
  subjectId: string | null = null,
): WorkoutError {
  return Object.freeze({ code, message, subjectId });
}

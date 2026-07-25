export const NutritionErrorCodes = {
  MISSING_INPUT: "missing_input",
  MISSING_ATHLETE: "missing_athlete",
  MISSING_PLAN: "missing_plan",
  INVALID_INPUT: "invalid_input",
  VALIDATION_FAILED: "validation_failed",
  POLICY_BLOCKED: "policy_blocked",
  EMPTY_PLAN: "empty_plan",
  INCONSISTENT_MEAL: "inconsistent_meal",
  INCONSISTENT_MACRO: "inconsistent_macro",
  INCONSISTENT_WEEK: "inconsistent_week",
} as const;

export type NutritionErrorCode =
  (typeof NutritionErrorCodes)[keyof typeof NutritionErrorCodes];

export interface NutritionError {
  readonly code: NutritionErrorCode;
  readonly message: string;
  readonly subjectId: string | null;
}

export function createNutritionError(
  code: NutritionErrorCode,
  message: string,
  subjectId: string | null = null,
): NutritionError {
  return Object.freeze({ code, message, subjectId });
}

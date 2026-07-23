export type NutritionValidationCode =
  | "invalid_calories"
  | "invalid_macros"
  | "invalid_meal_distribution"
  | "invalid_protein"
  | "invalid_fat"
  | "invalid_carbohydrates"
  | "invalid_fiber"
  | "invalid_hydration"
  | "invalid_supplements"
  | "diet_inconsistency"
  | "constraint_violation"
  | "preference_conflict"
  | "safety_violation"
  | "policy_violation"
  | "recommendation_invalid";

export const NutritionValidationCodes = Object.freeze({
  INVALID_CALORIES: "invalid_calories" as const,
  INVALID_MACROS: "invalid_macros" as const,
  INVALID_MEAL_DISTRIBUTION: "invalid_meal_distribution" as const,
  INVALID_PROTEIN: "invalid_protein" as const,
  INVALID_FAT: "invalid_fat" as const,
  INVALID_CARBOHYDRATES: "invalid_carbohydrates" as const,
  INVALID_FIBER: "invalid_fiber" as const,
  INVALID_HYDRATION: "invalid_hydration" as const,
  INVALID_SUPPLEMENTS: "invalid_supplements" as const,
  DIET_INCONSISTENCY: "diet_inconsistency" as const,
  CONSTRAINT_VIOLATION: "constraint_violation" as const,
  PREFERENCE_CONFLICT: "preference_conflict" as const,
  SAFETY_VIOLATION: "safety_violation" as const,
  POLICY_VIOLATION: "policy_violation" as const,
  RECOMMENDATION_INVALID: "recommendation_invalid" as const,
});

export interface NutritionValidationIssue {
  readonly code: NutritionValidationCode;
  readonly message: string;
  readonly path: string;
}

export interface NutritionValidation {
  readonly valid: boolean;
  readonly issues: readonly NutritionValidationIssue[];
}

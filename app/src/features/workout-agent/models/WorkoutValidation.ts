/**
 * Validation result for workout plans / objectives / recommendations.
 */
export interface WorkoutValidation {
  readonly valid: boolean;
  readonly issues: readonly WorkoutValidationIssue[];
}

export interface WorkoutValidationIssue {
  readonly code: WorkoutValidationCode;
  readonly message: string;
  readonly path: string | null;
}

export type WorkoutValidationCode =
  | "missing_objective"
  | "invalid_objective"
  | "split_inconsistent"
  | "exercise_incompatible"
  | "volume_out_of_range"
  | "intensity_out_of_range"
  | "recovery_insufficient"
  | "progression_unsafe"
  | "recommendation_invalid"
  | "missing_primary_lifts"
  | "days_out_of_range"
  | "policy_violation";

export const WorkoutValidationCodes = Object.freeze({
  MISSING_OBJECTIVE: "missing_objective" as const,
  INVALID_OBJECTIVE: "invalid_objective" as const,
  SPLIT_INCONSISTENT: "split_inconsistent" as const,
  EXERCISE_INCOMPATIBLE: "exercise_incompatible" as const,
  VOLUME_OUT_OF_RANGE: "volume_out_of_range" as const,
  INTENSITY_OUT_OF_RANGE: "intensity_out_of_range" as const,
  RECOVERY_INSUFFICIENT: "recovery_insufficient" as const,
  PROGRESSION_UNSAFE: "progression_unsafe" as const,
  RECOMMENDATION_INVALID: "recommendation_invalid" as const,
  MISSING_PRIMARY_LIFTS: "missing_primary_lifts" as const,
  DAYS_OUT_OF_RANGE: "days_out_of_range" as const,
  POLICY_VIOLATION: "policy_violation" as const,
});

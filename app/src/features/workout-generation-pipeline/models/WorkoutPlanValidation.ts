export const WorkoutPlanValidationCodes = {
  INTEGRITY: "integrity",
  PROGRESSION: "progression",
  ORDERING: "ordering",
  RECOMMENDATION: "recommendation",
  CONSTRAINTS: "constraints",
  GOALS: "goals",
  AVAILABILITY: "availability",
  RECOVERY: "recovery",
} as const;

export type WorkoutPlanValidationCode =
  (typeof WorkoutPlanValidationCodes)[keyof typeof WorkoutPlanValidationCodes];

export interface WorkoutPlanValidationIssue {
  readonly code: WorkoutPlanValidationCode;
  readonly message: string;
  readonly blocking: boolean;
}

export interface WorkoutPlanValidation {
  readonly valid: boolean;
  readonly issues: readonly WorkoutPlanValidationIssue[];
}

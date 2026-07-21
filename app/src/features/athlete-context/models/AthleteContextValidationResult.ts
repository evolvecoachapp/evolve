/** Structured validation issue codes — never prose. */
export type AthleteContextValidationCode =
  | "invalid_age"
  | "invalid_height"
  | "invalid_weight"
  | "invalid_goal"
  | "invalid_secondary_goal"
  | "invalid_goal_target_date"
  | "invalid_experience_level"
  | "invalid_years_training"
  | "invalid_training_started_at"
  | "invalid_days_per_week"
  | "invalid_session_duration"
  | "invalid_preferred_day"
  | "invalid_preferred_split"
  | "invalid_intensity_bias"
  | "invalid_equipment_item"
  | "invalid_injury_id"
  | "invalid_injury_region"
  | "invalid_injury_severity"
  | "missing_profile_id";

/** Single structured validation issue. */
export interface AthleteContextValidationIssue {
  readonly field: string;
  readonly code: AthleteContextValidationCode;
}

/**
 * Result of validating athlete context.
 *
 * Validation failures never throw — callers inspect `valid` / `issues`.
 */
export interface AthleteContextValidationResult {
  readonly valid: boolean;
  readonly issues: readonly AthleteContextValidationIssue[];
}

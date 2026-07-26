/**
 * Immutable notes package for a WorkoutPlan.
 */
export interface WorkoutNotes {
  readonly coachNotes: readonly string[];
  readonly recoveryNotes: readonly string[];
  readonly sessionNotes: readonly string[];
  readonly rationale: readonly string[];
}

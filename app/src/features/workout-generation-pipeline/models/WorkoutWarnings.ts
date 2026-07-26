/**
 * Immutable validation / constraint warnings for a WorkoutPlan.
 */
export interface WorkoutWarnings {
  readonly items: readonly string[];
  readonly blocking: boolean;
}

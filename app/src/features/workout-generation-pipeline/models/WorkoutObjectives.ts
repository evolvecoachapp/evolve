/**
 * Immutable training objectives for a WorkoutPlan.
 */
export interface WorkoutObjectives {
  readonly primary: string;
  readonly secondary: readonly string[];
  readonly goalKeys: readonly string[];
  readonly focusAreas: readonly string[];
}

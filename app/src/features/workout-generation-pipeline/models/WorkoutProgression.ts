/**
 * Immutable progression cues attached to a WorkoutPlan.
 */
export interface WorkoutProgression {
  readonly cue: string | null;
  readonly deloadRecommended: boolean;
  readonly weekNumber: number;
  readonly progressionPlanId: string | null;
  readonly notes: readonly string[];
}

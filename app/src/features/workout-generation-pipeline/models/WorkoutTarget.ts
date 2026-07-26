/**
 * Immutable prescription target within a WorkoutPlan.
 */
export interface WorkoutTarget {
  readonly id: string;
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly setIndex: number;
  readonly repMin: number;
  readonly repMax: number;
  readonly targetRpe: number | null;
  readonly targetRir: number | null;
  readonly intensityMetric: string | null;
  readonly intensityValue: number | null;
}

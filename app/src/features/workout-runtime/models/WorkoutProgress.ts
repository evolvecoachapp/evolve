/**
 * Aggregate completion progress for an active workout runtime.
 */
export interface WorkoutProgress {
  readonly totalExercises: number;
  readonly completedExercises: number;
  readonly skippedExercises: number;
  readonly remainingExercises: number;
  readonly totalSets: number;
  readonly completedSets: number;
  readonly skippedSets: number;
  readonly remainingSets: number;
  /** 0–100 overall completion percentage. */
  readonly completionPercent: number;
}

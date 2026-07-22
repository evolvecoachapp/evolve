/**
 * Single-session completion ratios (0–100).
 */
export interface CompletionMetrics {
  readonly totalExercises: number;
  readonly completedExercises: number;
  readonly skippedExercises: number;
  readonly totalSets: number;
  readonly completedSets: number;
  readonly skippedSets: number;
  /** 0–100 exercise completion percent (completed / total). */
  readonly exerciseCompletionPercent: number;
  /** 0–100 set completion percent (completed / total). */
  readonly setCompletionPercent: number;
  /** Overall workout completion percent from WorkoutResult progress. */
  readonly workoutCompletionPercent: number;
}

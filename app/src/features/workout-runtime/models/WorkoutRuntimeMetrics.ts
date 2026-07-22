/**
 * Structural runtime counters — not analytics or history.
 */
export interface WorkoutRuntimeMetrics {
  readonly totalExercises: number;
  readonly totalSets: number;
  readonly completedSets: number;
  readonly skippedSets: number;
  readonly completedExercises: number;
  readonly skippedExercises: number;
  readonly eventCount: number;
  readonly pauseCount: number;
}

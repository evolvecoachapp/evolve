/**
 * Aggregate statistics across all completed workouts.
 *
 * Computed from `WorkoutHistoryRepository` sessions — not persisted separately.
 */
export interface WorkoutAnalytics {
  readonly totalWorkouts: number;
  /** Sum of session `estimatedVolumeKg` (kg·reps). */
  readonly totalVolumeKg: number;
  /** Sum of session `completedSets`. */
  readonly totalSets: number;
  /** Sum of completed set reps (exercise snapshots; legacy fallback when absent). */
  readonly totalReps: number;
  /**
   * Mean `durationSeconds` across sessions.
   * `null` when there are no workouts.
   */
  readonly averageDurationSeconds: number | null;
  /**
   * Mean `estimatedVolumeKg` across sessions.
   * `null` when there are no workouts.
   */
  readonly averageVolumeKg: number | null;
}

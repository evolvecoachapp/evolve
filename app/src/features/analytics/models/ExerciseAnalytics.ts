/**
 * Per-exercise statistics derived from completed workout history.
 *
 * Grouped by exercise id across all sessions that include that exercise.
 */
export interface ExerciseAnalytics {
  readonly exerciseId: string;
  readonly exerciseName: string;
  /** Heaviest completed set load (kg). `null` when no sets recorded. */
  readonly bestWeightKg: number | null;
  /** Highest single-set volume (weight × reps). `null` when no sets recorded. */
  readonly bestVolumeKg: number | null;
  /** Mean reps across all completed sets for this exercise. `null` when none. */
  readonly averageReps: number | null;
  /** Distinct sessions that included at least one completed set of this exercise. */
  readonly sessionsPerformed: number;
  /** ISO-8601 `completedAt` of the most recent session that included this exercise. */
  readonly lastPerformedAt: string | null;
}

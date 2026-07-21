/**
 * Local presentation model for a finished interactive workout session.
 *
 * Derived from the immutable application `WorkoutSession` plus the local
 * execution overlay — never mutates either source. Not persisted.
 */

/** Completion metrics projected for the Workout Complete experience. */
export interface WorkoutSessionSummary {
  readonly sessionId: string;
  /** Session title from the immutable prescription. */
  readonly title: string;
  /** Wall-clock duration from session screen entry to finish (seconds). */
  readonly durationSeconds: number;
  /** Exercises with at least one completed set and no pending sets. */
  readonly completedExercises: number;
  readonly totalExercises: number;
  readonly completedSets: number;
  readonly skippedSets: number;
  readonly totalSets: number;
  /** 0–100 based on accounted (completed + skipped) / total sets. */
  readonly completionPercent: number;
  /** Sum of completedLoad × completedReps for completed sets (kg·reps). */
  readonly estimatedVolumeKg: number;
  /**
   * Mean completed reps across completed working sets.
   * `null` when no working sets were completed.
   */
  readonly averageCompletedReps: number | null;
  /** ISO-8601 timestamp when the athlete finished. */
  readonly completedAt: string;
}

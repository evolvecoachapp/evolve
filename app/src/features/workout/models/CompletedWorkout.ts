/**
 * Domain model for a finished interactive workout session persisted on-device.
 *
 * Derived from the presentation `WorkoutSessionSummary` at finish time.
 * Identity is the session id; later sprints may enrich this shape without
 * changing the repository contract.
 */
export interface CompletedWorkout {
  /** Stable identity — equals `sessionId`. */
  readonly id: string;
  readonly sessionId: string;
  readonly title: string;
  /** Wall-clock duration from session entry to finish (seconds). */
  readonly durationSeconds: number;
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

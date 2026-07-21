/**
 * Domain model for a finished interactive workout session persisted on-device.
 *
 * Derived from the presentation `WorkoutSessionSummary` at finish time.
 * Identity is the session id; later sprints may enrich this shape without
 * changing the repository contract.
 */

/** A single completed set snapshot for history detail. */
export interface CompletedWorkoutSet {
  readonly id: string;
  /** 1-based set number within the exercise (from prescription order). */
  readonly setNumber: number;
  /** Completed load in kilograms. */
  readonly weightKg: number;
  readonly reps: number;
}

/** An exercise snapshot with its completed sets only. */
export interface CompletedWorkoutExercise {
  readonly id: string;
  readonly name: string;
  /** 0-based order within the session. */
  readonly order: number;
  readonly sets: readonly CompletedWorkoutSet[];
}

export interface CompletedWorkout {
  /** Stable identity — equals `sessionId`. */
  readonly id: string;
  readonly sessionId: string;
  readonly title: string;
  /**
   * Optional program title when the session was built from a program preview.
   * `null` for legacy entries or sessions without a program context.
   */
  readonly programName: string | null;
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
  /**
   * Ordered exercises with completed sets for detail rendering.
   * Empty for legacy history entries persisted before Sprint 13.2.
   */
  readonly exercises: readonly CompletedWorkoutExercise[];
}

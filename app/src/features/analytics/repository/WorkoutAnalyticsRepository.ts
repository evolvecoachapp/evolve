import type { ExerciseAnalytics } from "../models/ExerciseAnalytics";
import type { WeeklyAnalytics } from "../models/WeeklyAnalytics";
import type { WorkoutAnalytics } from "../models/WorkoutAnalytics";
import type { WorkoutTrend } from "../models/WorkoutTrend";

/**
 * Read-only analytics derived from completed workout history.
 *
 * Implementations must consume `WorkoutHistoryRepository` (or an equivalent
 * session source) — analytics are never persisted as a separate store.
 */
export interface WorkoutAnalyticsRepository {
  /** Aggregate totals across all completed sessions. */
  getWorkoutAnalytics(): Promise<WorkoutAnalytics>;

  /**
   * Per-exercise analytics for every exercise seen in history.
   * Pass `exerciseId` to return a single-element list (or empty when unknown).
   */
  getExerciseAnalytics(exerciseId?: string): Promise<readonly ExerciseAnalytics[]>;

  /**
   * Current / previous UTC week volume and sessions-per-week rate.
   * @param referenceDate - Anchor for "current" week; defaults to now.
   */
  getWeeklyAnalytics(referenceDate?: Date): Promise<WeeklyAnalytics>;

  /**
   * Weekly volume series (oldest → newest).
   * @param weeks - Window length ending at the reference week (default 8).
   */
  getVolumeTrend(weeks?: number, referenceDate?: Date): Promise<WorkoutTrend>;

  /**
   * Weekly workout-count series (oldest → newest).
   * @param weeks - Window length ending at the reference week (default 8).
   */
  getWorkoutFrequency(
    weeks?: number,
    referenceDate?: Date,
  ): Promise<WorkoutTrend>;

  /**
   * Weekly count of sessions that included `exerciseId`.
   * @param weeks - Window length ending at the reference week (default 8).
   */
  getExerciseFrequency(
    exerciseId: string,
    weeks?: number,
    referenceDate?: Date,
  ): Promise<WorkoutTrend>;
}

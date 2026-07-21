import type { ExerciseRecord } from "../models/ExerciseRecord";
import type { RecordSummary } from "../models/RecordSummary";
import type { WorkoutRecord } from "../models/WorkoutRecord";

/**
 * Read-only personal records derived from analytics + completed history.
 *
 * Implementations must consume `WorkoutAnalyticsRepository` for lifetime
 * aggregates and must never read AsyncStorage directly.
 */
export interface WorkoutRecordsRepository {
  /** Cross-exercise lifetime personal record highlights. */
  getWorkoutRecord(): Promise<WorkoutRecord>;

  /**
   * Per-exercise personal records.
   * Pass `exerciseId` to return a single-element list (or empty when unknown).
   */
  getExerciseRecords(exerciseId?: string): Promise<readonly ExerciseRecord[]>;

  /** Lifetime volume, sessions, and last record date. */
  getRecordSummary(): Promise<RecordSummary>;
}

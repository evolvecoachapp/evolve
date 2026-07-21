import type { WorkoutAnalyticsRepository } from "../../analytics/repository";
import type { WorkoutHistoryRepository } from "../../workout/repository";
import type { ExerciseRecord } from "../models/ExerciseRecord";
import type { RecordSummary } from "../models/RecordSummary";
import type { WorkoutRecord } from "../models/WorkoutRecord";
import {
  computeExerciseRecordForId,
  computeExerciseRecords,
  computeRecordSummary,
  computeWorkoutRecord,
} from "../utils";
import type { WorkoutRecordsRepository } from "./WorkoutRecordsRepository";

/**
 * Records repository backed by analytics (lifetime stats) and history
 * (set-level personal records / Epley estimates).
 *
 * Lifetime volume and session counts come from `WorkoutAnalyticsRepository`.
 * Set-level records are scanned from completed sessions via
 * `WorkoutHistoryRepository` — never AsyncStorage directly.
 */
export class HistoryBackedWorkoutRecordsRepository
  implements WorkoutRecordsRepository
{
  constructor(
    private readonly analytics: WorkoutAnalyticsRepository,
    private readonly history: WorkoutHistoryRepository,
  ) {}

  async getWorkoutRecord(): Promise<WorkoutRecord> {
    const sessions = await this.history.getCompletedSessions();
    return computeWorkoutRecord(sessions);
  }

  async getExerciseRecords(
    exerciseId?: string,
  ): Promise<readonly ExerciseRecord[]> {
    const sessions = await this.history.getCompletedSessions();
    if (exerciseId == null) {
      return computeExerciseRecords(sessions);
    }
    const single = computeExerciseRecordForId(sessions, exerciseId);
    return single == null ? Object.freeze([]) : Object.freeze([single]);
  }

  async getRecordSummary(): Promise<RecordSummary> {
    const [workout, sessions] = await Promise.all([
      this.analytics.getWorkoutAnalytics(),
      this.history.getCompletedSessions(),
    ]);
    const exercises = computeExerciseRecords(sessions);
    return computeRecordSummary(workout, exercises);
  }
}

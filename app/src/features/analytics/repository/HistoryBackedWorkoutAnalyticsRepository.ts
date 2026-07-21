import type { WorkoutHistoryRepository } from "../../workout/repository";
import type { ExerciseAnalytics } from "../models/ExerciseAnalytics";
import type { WeeklyAnalytics } from "../models/WeeklyAnalytics";
import type { WorkoutAnalytics } from "../models/WorkoutAnalytics";
import type { WorkoutTrend } from "../models/WorkoutTrend";
import {
  computeExerciseAnalytics,
  computeExerciseAnalyticsForId,
  computeExerciseFrequency,
  computeVolumeTrend,
  computeWeeklyAnalytics,
  computeWorkoutAnalytics,
  computeWorkoutFrequency,
} from "../utils";
import type { WorkoutAnalyticsRepository } from "./WorkoutAnalyticsRepository";

/**
 * Analytics repository backed by completed workout history.
 *
 * Loads sessions once per call via `WorkoutHistoryRepository` and runs pure
 * domain compute helpers — no separate analytics persistence.
 */
export class HistoryBackedWorkoutAnalyticsRepository
  implements WorkoutAnalyticsRepository
{
  constructor(private readonly history: WorkoutHistoryRepository) {}

  async getWorkoutAnalytics(): Promise<WorkoutAnalytics> {
    const sessions = await this.history.getCompletedSessions();
    return computeWorkoutAnalytics(sessions);
  }

  async getExerciseAnalytics(
    exerciseId?: string,
  ): Promise<readonly ExerciseAnalytics[]> {
    const sessions = await this.history.getCompletedSessions();
    if (exerciseId == null) {
      return computeExerciseAnalytics(sessions);
    }
    const single = computeExerciseAnalyticsForId(sessions, exerciseId);
    return single == null ? Object.freeze([]) : Object.freeze([single]);
  }

  async getWeeklyAnalytics(referenceDate: Date = new Date()): Promise<WeeklyAnalytics> {
    const sessions = await this.history.getCompletedSessions();
    return computeWeeklyAnalytics(sessions, referenceDate);
  }

  async getVolumeTrend(
    weeks?: number,
    referenceDate: Date = new Date(),
  ): Promise<WorkoutTrend> {
    const sessions = await this.history.getCompletedSessions();
    return computeVolumeTrend(sessions, { weeks, referenceDate });
  }

  async getWorkoutFrequency(
    weeks?: number,
    referenceDate: Date = new Date(),
  ): Promise<WorkoutTrend> {
    const sessions = await this.history.getCompletedSessions();
    return computeWorkoutFrequency(sessions, { weeks, referenceDate });
  }

  async getExerciseFrequency(
    exerciseId: string,
    weeks?: number,
    referenceDate: Date = new Date(),
  ): Promise<WorkoutTrend> {
    const sessions = await this.history.getCompletedSessions();
    return computeExerciseFrequency(sessions, exerciseId, {
      weeks,
      referenceDate,
    });
  }
}

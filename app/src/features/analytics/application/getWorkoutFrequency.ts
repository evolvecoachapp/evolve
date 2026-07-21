import {
  workoutAnalyticsRepository,
  type WorkoutAnalyticsRepository,
} from "../repository";
import type { WorkoutTrend } from "../models/WorkoutTrend";

/** Weekly workout-frequency trend series. */
export function getWorkoutFrequency(
  weeks?: number,
  referenceDate?: Date,
  repository: WorkoutAnalyticsRepository = workoutAnalyticsRepository,
): Promise<WorkoutTrend> {
  return repository.getWorkoutFrequency(weeks, referenceDate);
}

import {
  workoutAnalyticsRepository,
  type WorkoutAnalyticsRepository,
} from "../repository";
import type { WorkoutTrend } from "../models/WorkoutTrend";

/** Weekly volume trend series. */
export function getVolumeTrend(
  weeks?: number,
  referenceDate?: Date,
  repository: WorkoutAnalyticsRepository = workoutAnalyticsRepository,
): Promise<WorkoutTrend> {
  return repository.getVolumeTrend(weeks, referenceDate);
}

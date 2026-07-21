import {
  workoutAnalyticsRepository,
  type WorkoutAnalyticsRepository,
} from "../repository";
import type { WeeklyAnalytics } from "../models/WeeklyAnalytics";

/** Current / previous week volume and sessions-per-week rate. */
export function getWeeklyAnalytics(
  referenceDate?: Date,
  repository: WorkoutAnalyticsRepository = workoutAnalyticsRepository,
): Promise<WeeklyAnalytics> {
  return repository.getWeeklyAnalytics(referenceDate);
}

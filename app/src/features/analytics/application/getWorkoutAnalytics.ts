import {
  workoutAnalyticsRepository,
  type WorkoutAnalyticsRepository,
} from "../repository";
import type { WorkoutAnalytics } from "../models/WorkoutAnalytics";

/** Aggregate workout statistics via the analytics repository. */
export function getWorkoutAnalytics(
  repository: WorkoutAnalyticsRepository = workoutAnalyticsRepository,
): Promise<WorkoutAnalytics> {
  return repository.getWorkoutAnalytics();
}

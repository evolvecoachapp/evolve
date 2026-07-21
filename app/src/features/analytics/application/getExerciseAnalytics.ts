import {
  workoutAnalyticsRepository,
  type WorkoutAnalyticsRepository,
} from "../repository";
import type { ExerciseAnalytics } from "../models/ExerciseAnalytics";

/** Per-exercise analytics; optional `exerciseId` filters to one exercise. */
export function getExerciseAnalytics(
  exerciseId?: string,
  repository: WorkoutAnalyticsRepository = workoutAnalyticsRepository,
): Promise<readonly ExerciseAnalytics[]> {
  return repository.getExerciseAnalytics(exerciseId);
}

import {
  workoutAnalyticsRepository,
  type WorkoutAnalyticsRepository,
} from "../repository";
import type { WorkoutTrend } from "../models/WorkoutTrend";

/** Weekly exercise-frequency trend series for a single exercise. */
export function getExerciseFrequency(
  exerciseId: string,
  weeks?: number,
  referenceDate?: Date,
  repository: WorkoutAnalyticsRepository = workoutAnalyticsRepository,
): Promise<WorkoutTrend> {
  return repository.getExerciseFrequency(exerciseId, weeks, referenceDate);
}

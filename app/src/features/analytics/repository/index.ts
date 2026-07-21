import { workoutHistoryRepository } from "../../workout/repository";
import { HistoryBackedWorkoutAnalyticsRepository } from "./HistoryBackedWorkoutAnalyticsRepository";
import type { WorkoutAnalyticsRepository } from "./WorkoutAnalyticsRepository";

export type { WorkoutAnalyticsRepository } from "./WorkoutAnalyticsRepository";
export { HistoryBackedWorkoutAnalyticsRepository } from "./HistoryBackedWorkoutAnalyticsRepository";

/** Default analytics repository (history-backed, on-device). */
export const workoutAnalyticsRepository: WorkoutAnalyticsRepository =
  new HistoryBackedWorkoutAnalyticsRepository(workoutHistoryRepository);

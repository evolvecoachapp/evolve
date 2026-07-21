import { workoutAnalyticsRepository } from "../../analytics/repository";
import { workoutHistoryRepository } from "../../workout/repository";
import { HistoryBackedWorkoutRecordsRepository } from "./HistoryBackedWorkoutRecordsRepository";
import type { WorkoutRecordsRepository } from "./WorkoutRecordsRepository";

export type { WorkoutRecordsRepository } from "./WorkoutRecordsRepository";
export { HistoryBackedWorkoutRecordsRepository } from "./HistoryBackedWorkoutRecordsRepository";

/** Default records repository (analytics + history backed, on-device). */
export const workoutRecordsRepository: WorkoutRecordsRepository =
  new HistoryBackedWorkoutRecordsRepository(
    workoutAnalyticsRepository,
    workoutHistoryRepository,
  );

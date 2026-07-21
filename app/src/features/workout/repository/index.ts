import { AsyncStorageAdapter } from "../../../core/storage";
import { AsyncStorageWorkoutHistoryRepository } from "./AsyncStorageWorkoutHistoryRepository";
import type { WorkoutHistoryRepository } from "./WorkoutHistoryRepository";

export type { WorkoutHistoryRepository } from "./WorkoutHistoryRepository";
export {
  AsyncStorageWorkoutHistoryRepository,
  WORKOUT_HISTORY_STORAGE_KEY,
} from "./AsyncStorageWorkoutHistoryRepository";

/** Default on-device workout history repository (AsyncStorage-backed). */
export const workoutHistoryRepository: WorkoutHistoryRepository =
  new AsyncStorageWorkoutHistoryRepository(new AsyncStorageAdapter());

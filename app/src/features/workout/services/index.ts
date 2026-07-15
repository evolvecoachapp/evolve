export { workoutService } from "./defaultWorkoutService";
export { createWorkoutService, resolveWorkoutProviderId } from "./workoutServiceFactory";
export type {
  WorkoutProviderId,
  WorkoutService,
  SavedSetResult,
  SaveSetRequest,
  SkipExerciseRequest,
} from "../types/workoutService";
export { WorkoutServiceError } from "../types/workoutService";
export { mockWorkoutService } from "../providers/MockWorkoutService";
export { backendWorkoutService } from "../providers/BackendWorkoutService";
export { localWorkoutService } from "../providers/LocalWorkoutService";
export { consumePendingSession, setPendingSession } from "./sessionHandoff";

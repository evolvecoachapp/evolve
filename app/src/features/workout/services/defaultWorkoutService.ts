import { createWorkoutService } from "./workoutServiceFactory";

/** Singleton used by the Workout UI — swap providers via EXPO_PUBLIC_WORKOUT_PROVIDER. */
export const workoutService = createWorkoutService();

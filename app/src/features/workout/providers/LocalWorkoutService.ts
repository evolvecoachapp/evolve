import type { ExerciseHistory } from "../models/ExerciseHistory";
import type { Workout } from "../models/Workout";
import type { WorkoutSession } from "../models/WorkoutSession";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import {
  WorkoutServiceError,
  type SaveSetRequest,
  type SkipExerciseRequest,
  type WorkoutService,
} from "../types/workoutService";

function notConfigured(): never {
  throw new WorkoutServiceError(
    "local provider is not configured. Wire on-device storage before enabling this provider.",
    "local",
  );
}

/** Placeholder for on-device workout storage — implement when local persistence is available. */
export const localWorkoutService: WorkoutService = {
  providerId: "local",

  async getTodayWorkout(): Promise<Workout> {
    return notConfigured();
  },

  async getWorkout(): Promise<Workout | null> {
    return notConfigured();
  },

  async startWorkout(): Promise<WorkoutSession> {
    return notConfigured();
  },

  async finishWorkout(): Promise<WorkoutSummary> {
    return notConfigured();
  },

  async saveSet(_request: SaveSetRequest): Promise<void> {
    return notConfigured();
  },

  async skipExercise(_request: SkipExerciseRequest): Promise<void> {
    return notConfigured();
  },

  async getHistory(): Promise<ExerciseHistory[]> {
    return notConfigured();
  },
};

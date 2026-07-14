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
    "backend provider is not configured. Wire the EVOLVE API before enabling this provider.",
    "backend",
  );
}

/** Placeholder for the EVOLVE backend — implement when FastAPI integration is available. */
export const backendWorkoutService: WorkoutService = {
  providerId: "backend",

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

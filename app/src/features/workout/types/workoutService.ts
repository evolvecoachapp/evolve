import type { ExerciseHistory } from "../models/ExerciseHistory";
import type { Workout } from "../models/Workout";
import type { WorkoutSession } from "../models/WorkoutSession";
import type { WorkoutSummary } from "../models/WorkoutSummary";

export type WorkoutProviderId = "mock" | "backend" | "local";

export interface SaveSetRequest {
  sessionId: string;
  exerciseId: string;
  setId: string;
  completedReps: number | null;
  completedWeight: number | null;
  rpe: number | null;
  completed: boolean;
}

export interface SkipExerciseRequest {
  sessionId: string;
  exerciseId: string;
}

/** Contract for Workout backends — UI and hooks depend on this interface only. */
export interface WorkoutService {
  readonly providerId: WorkoutProviderId;

  getTodayWorkout(): Promise<Workout>;
  getWorkout(id: string): Promise<Workout | null>;
  startWorkout(workoutId: string): Promise<WorkoutSession>;
  finishWorkout(sessionId: string): Promise<WorkoutSummary>;
  saveSet(request: SaveSetRequest): Promise<void>;
  skipExercise(request: SkipExerciseRequest): Promise<void>;
  getHistory(): Promise<ExerciseHistory[]>;
}

export class WorkoutServiceError extends Error {
  constructor(
    message: string,
    readonly providerId?: WorkoutProviderId,
  ) {
    super(message);
    this.name = "WorkoutServiceError";
  }
}

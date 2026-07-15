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

/**
 * Server-confirmed result of a logged/updated set — enough for the caller to
 * optimistically merge it into an in-memory `WorkoutSession` without an extra
 * full-session fetch. `null` when the write removed the set (un-completing it).
 */
export interface SavedSetResult {
  id: string;
  completedReps: number | null;
  completedWeight: number | null;
  rpe: number | null;
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
  getSession(sessionId: string): Promise<WorkoutSession | null>;
  /** The user's current `in_progress` session, if any — used to offer resume instead of starting a duplicate. */
  getActiveSession(): Promise<WorkoutSession | null>;
  startWorkout(workoutId: string): Promise<WorkoutSession>;
  finishWorkout(sessionId: string): Promise<WorkoutSummary>;
  saveSet(request: SaveSetRequest): Promise<SavedSetResult | null>;
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

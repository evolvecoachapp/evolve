import type { CompletedWorkout } from "../models/CompletedWorkout";
import {
  workoutHistoryRepository,
  type WorkoutHistoryRepository,
} from "../repository";

/**
 * Loads a single completed workout by session id via the repository.
 * Returns `null` when the workout is missing — UI decides empty/error state.
 */
export function getCompletedSession(
  sessionId: string,
  repository: WorkoutHistoryRepository = workoutHistoryRepository,
): Promise<CompletedWorkout | null> {
  return repository.getCompletedSession(sessionId);
}

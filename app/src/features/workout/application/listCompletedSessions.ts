import type { CompletedWorkout } from "../models/CompletedWorkout";
import {
  workoutHistoryRepository,
  type WorkoutHistoryRepository,
} from "../repository";

/**
 * Application use-case: load completed workouts for the history timeline.
 *
 * UI must not call the repository directly — route through this service.
 * Ordering is newest `completedAt` first (repository contract).
 */
export async function listCompletedSessions(
  repository: WorkoutHistoryRepository = workoutHistoryRepository,
): Promise<readonly CompletedWorkout[]> {
  return repository.getCompletedSessions();
}

import type { WorkoutSessionSummary } from "../types/workoutSessionSummary";
import type { CompletedWorkout } from "../models/CompletedWorkout";
import {
  workoutHistoryRepository,
  type WorkoutHistoryRepository,
} from "../repository";
import { toCompletedWorkout } from "./toCompletedWorkout";

/**
 * Application use-case: persist a finished session after its summary is built.
 *
 * UI must not call the repository directly — route through this service.
 * Persistence failures are the caller's concern (finish flow swallows them).
 */
export async function persistCompletedSession(
  summary: WorkoutSessionSummary,
  repository: WorkoutHistoryRepository = workoutHistoryRepository,
): Promise<CompletedWorkout> {
  const completed = toCompletedWorkout(summary);
  await repository.saveCompletedSession(completed);
  return completed;
}

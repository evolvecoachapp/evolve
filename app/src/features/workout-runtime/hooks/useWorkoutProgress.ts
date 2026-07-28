import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";

export interface UseWorkoutProgressOptions {
  readonly runtime: WorkoutRuntime | null;
}

/** Read-only progress projection from the runtime model. */
export function useWorkoutProgress({ runtime }: UseWorkoutProgressOptions) {
  const progress = runtime?.progress ?? null;
  const statistics = runtime?.statistics ?? null;

  return {
    progress,
    statistics,
    completionPercent: progress?.completionPercent ?? 0,
    completedSets: progress?.completedSets ?? 0,
    remainingSets: progress?.remainingSets ?? 0,
    durationSeconds: progress?.durationSeconds ?? 0,
    estimatedRemainingMinutes: progress?.estimatedRemainingMinutes ?? 0,
  };
}

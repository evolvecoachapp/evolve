/** Immutable workout session statistics for the runtime UI. */
export interface WorkoutStatistics {
  readonly totalVolume: number;
  readonly completedSets: number;
  readonly remainingSets: number;
  readonly averageRpe: number | null;
  readonly durationSeconds: number;
  readonly estimatedRemainingMinutes: number;
}

export function createWorkoutStatistics(
  input: WorkoutStatistics,
): WorkoutStatistics {
  return Object.freeze({ ...input });
}

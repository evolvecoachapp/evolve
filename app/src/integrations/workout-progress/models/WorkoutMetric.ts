/** Immutable workout metric representation — no calculations. */
export interface WorkoutMetric {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
}

export function createWorkoutMetric(input: WorkoutMetric): WorkoutMetric {
  return Object.freeze({ ...input });
}

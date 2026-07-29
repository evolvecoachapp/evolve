import type { ProgressChart } from "./ProgressChart";

export interface WorkoutStatistics {
  readonly totalWorkouts: number;
  readonly totalVolumeKg: number;
  readonly averageDurationMinutes: number;
  readonly averageRpe: number | null;
  readonly completionRatePercent: number;
  readonly chart: ProgressChart | null;
  readonly destination: string | null;
}

export function createWorkoutStatistics(input: WorkoutStatistics): WorkoutStatistics {
  return Object.freeze({ ...input });
}

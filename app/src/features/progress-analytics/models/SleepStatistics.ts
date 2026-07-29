import type { ProgressChart } from "./ProgressChart";

export interface SleepStatistics {
  readonly averageHours: number;
  readonly averageQualityScore: number | null;
  readonly consistencyPercent: number;
  readonly chart: ProgressChart | null;
  readonly destination: string | null;
}

export function createSleepStatistics(input: SleepStatistics): SleepStatistics {
  return Object.freeze({ ...input });
}

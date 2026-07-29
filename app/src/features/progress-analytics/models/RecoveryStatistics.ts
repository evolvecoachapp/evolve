import type { ProgressChart } from "./ProgressChart";

export interface RecoveryStatistics {
  readonly averageScore: number;
  readonly trend: "improving" | "stable" | "declining";
  readonly readinessLabel: string;
  readonly restingHeartRate: number | null;
  readonly hrvAverage: number | null;
  readonly chart: ProgressChart | null;
  readonly destination: string | null;
}

export function createRecoveryStatistics(input: RecoveryStatistics): RecoveryStatistics {
  return Object.freeze({ ...input });
}

import type { ChartSeries } from "./ChartModel";

export type RecoveryTrend = "improving" | "stable" | "declining";

export interface RecoveryProgress {
  readonly averageScore: number;
  readonly trend: RecoveryTrend;
  readonly sleepAverageHours: number;
  readonly readinessLabel: string;
  readonly chart: ChartSeries;
  readonly destination: string | null;
}

export function createRecoveryProgress(input: RecoveryProgress): RecoveryProgress {
  return Object.freeze({ ...input });
}

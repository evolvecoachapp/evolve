import type { ProgressChart } from "./ProgressChart";

export interface RecoveryStatisticsEntry {
  readonly id: string;
  readonly date: string;
  readonly title: string;
  readonly assessedAt: string;
  readonly recoveryScore: number;
  readonly readinessLabel: string;
  readonly hrvScore: number | null;
  readonly destination: string | null;
}

export function createRecoveryStatisticsEntry(
  input: RecoveryStatisticsEntry,
): RecoveryStatisticsEntry {
  return Object.freeze({ ...input });
}

export interface RecoveryStatistics {
  readonly averageScore: number;
  readonly trend: "improving" | "stable" | "declining";
  readonly readinessLabel: string;
  readonly restingHeartRate: number | null;
  readonly hrvAverage: number | null;
  readonly entries: readonly RecoveryStatisticsEntry[];
  readonly chart: ProgressChart | null;
  readonly destination: string | null;
}

export function createRecoveryStatistics(input: RecoveryStatistics): RecoveryStatistics {
  return Object.freeze({
    ...input,
    entries: Object.freeze([...input.entries]),
  });
}

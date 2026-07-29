import type { ChartSeries } from "./ChartModel";

export interface StrengthProgress {
  readonly estimatedOneRepMaxKg: number;
  readonly changePercent: number;
  readonly strongestLift: string;
  readonly personalRecordsCount: number;
  readonly chart: ChartSeries;
  readonly destination: string | null;
}

export function createStrengthProgress(input: StrengthProgress): StrengthProgress {
  return Object.freeze({ ...input });
}

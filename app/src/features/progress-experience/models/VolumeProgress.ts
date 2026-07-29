import type { ChartSeries } from "./ChartModel";

export interface VolumeProgress {
  readonly totalVolumeKg: number;
  readonly changePercent: number;
  readonly workoutsCompleted: number;
  readonly weeklyProgressLabel: string;
  readonly monthlyProgressLabel: string;
  readonly chart: ChartSeries;
  readonly destination: string | null;
}

export function createVolumeProgress(input: VolumeProgress): VolumeProgress {
  return Object.freeze({ ...input });
}

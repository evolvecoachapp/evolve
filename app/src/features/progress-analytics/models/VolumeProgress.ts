import type { ProgressChart } from "./ProgressChart";

export interface VolumeProgress {
  readonly totalVolumeKg: number;
  readonly changePercent: number;
  readonly weeklyAverageKg: number;
  readonly chart: ProgressChart | null;
  readonly destination: string | null;
}

export function createVolumeProgress(input: VolumeProgress): VolumeProgress {
  return Object.freeze({ ...input });
}

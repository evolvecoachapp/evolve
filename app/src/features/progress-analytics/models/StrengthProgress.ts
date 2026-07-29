import type { ProgressChart } from "./ProgressChart";

export interface StrengthProgress {
  readonly estimatedOneRepMaxKg: number;
  readonly changePercent: number;
  readonly strongestLift: string;
  readonly personalRecordsCount: number;
  readonly chart: ProgressChart | null;
  readonly destination: string | null;
}

export function createStrengthProgress(input: StrengthProgress): StrengthProgress {
  return Object.freeze({ ...input });
}

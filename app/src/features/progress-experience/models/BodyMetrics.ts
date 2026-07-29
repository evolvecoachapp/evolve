import type { ChartSeries } from "./ChartModel";

export interface BodyMetrics {
  readonly bodyWeightKg: number;
  readonly bodyWeightChangeKg: number;
  readonly bodyFatPercent: number | null;
  readonly leanMassKg: number;
  readonly chart: ChartSeries;
  readonly destination: string | null;
}

export function createBodyMetrics(input: BodyMetrics): BodyMetrics {
  return Object.freeze({ ...input });
}

import type { AnalyticsCategory } from "./AnalyticsCategory";
import type { ProgressChart } from "./ProgressChart";

export interface PerformanceTrend {
  readonly id: string;
  readonly category: AnalyticsCategory;
  readonly label: string;
  readonly direction: "up" | "flat" | "down";
  readonly changePercent: number;
  readonly chart: ProgressChart | null;
  readonly destination: string | null;
}

export function createPerformanceTrend(input: PerformanceTrend): PerformanceTrend {
  return Object.freeze({ ...input });
}

import type { AnalyticsCategory } from "./AnalyticsCategory";

export const ChartTypes = {
  LINE: "line",
  BAR: "bar",
  AREA: "area",
  RADAR: "radar",
  SCATTER: "scatter",
} as const;

export type ChartType = (typeof ChartTypes)[keyof typeof ChartTypes];

export interface ChartDataPoint {
  readonly label: string;
  readonly value: number;
  readonly secondaryValue: number | null;
}

export interface ChartSeries {
  readonly id: string;
  readonly label: string;
  readonly points: readonly ChartDataPoint[];
}

export interface ProgressChart {
  readonly id: string;
  readonly title: string;
  readonly type: ChartType;
  readonly unit: string;
  readonly category: AnalyticsCategory;
  readonly points: readonly ChartDataPoint[];
  readonly series: readonly ChartSeries[];
}

export function createChartDataPoint(input: ChartDataPoint): ChartDataPoint {
  return Object.freeze({ ...input });
}

export function createChartSeries(input: {
  readonly id: string;
  readonly label: string;
  readonly points: readonly ChartDataPoint[];
}): ChartSeries {
  return Object.freeze({
    id: input.id,
    label: input.label,
    points: Object.freeze(input.points.map((p) => createChartDataPoint(p))),
  });
}

export function createProgressChart(input: ProgressChart): ProgressChart {
  return Object.freeze({
    ...input,
    points: Object.freeze(input.points.map((p) => createChartDataPoint(p))),
    series: Object.freeze(input.series.map((s) => createChartSeries(s))),
  });
}

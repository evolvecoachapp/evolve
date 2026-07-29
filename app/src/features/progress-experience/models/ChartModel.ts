export interface ChartPoint {
  readonly label: string;
  readonly value: number;
}

export interface ChartSeries {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly points: readonly ChartPoint[];
}

export function createChartPoint(label: string, value: number): ChartPoint {
  return Object.freeze({ label, value });
}

export function createChartSeries(input: {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly points: readonly ChartPoint[];
}): ChartSeries {
  return Object.freeze({
    id: input.id,
    label: input.label,
    unit: input.unit,
    points: Object.freeze([...input.points]),
  });
}

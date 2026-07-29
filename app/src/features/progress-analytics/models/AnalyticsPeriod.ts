export const AnalyticsPeriodKinds = {
  TODAY: "today",
  WEEK: "week",
  MONTH: "month",
  QUARTER: "quarter",
  YEAR: "year",
  CUSTOM: "custom",
} as const;

export type AnalyticsPeriodKind = (typeof AnalyticsPeriodKinds)[keyof typeof AnalyticsPeriodKinds];

export interface AnalyticsPeriod {
  readonly kind: AnalyticsPeriodKind;
  readonly label: string;
  readonly startDate: string | null;
  readonly endDate: string | null;
}

export function createAnalyticsPeriod(input: AnalyticsPeriod): AnalyticsPeriod {
  return Object.freeze({ ...input });
}

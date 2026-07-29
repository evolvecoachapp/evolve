export const TimelinePeriodKinds = {
  TODAY: "today",
  YESTERDAY: "yesterday",
  WEEK: "week",
  MONTH: "month",
  QUARTER: "quarter",
  YEAR: "year",
  CUSTOM: "custom",
} as const;

export type TimelinePeriodKind = (typeof TimelinePeriodKinds)[keyof typeof TimelinePeriodKinds];

export interface TimelinePeriod {
  readonly kind: TimelinePeriodKind;
  readonly label: string;
  readonly startDate: string | null;
  readonly endDate: string | null;
}

export function createTimelinePeriod(input: TimelinePeriod): TimelinePeriod {
  return Object.freeze({ ...input });
}

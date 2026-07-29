export const TimeRanges = {
  LAST_7_DAYS: "7d",
  LAST_30_DAYS: "30d",
  LAST_90_DAYS: "90d",
  LAST_YEAR: "1y",
  ALL_TIME: "all",
} as const;

export type TimeRange = (typeof TimeRanges)[keyof typeof TimeRanges];

export interface TimeRangeOption {
  readonly value: TimeRange;
  readonly label: string;
}

export const TIME_RANGE_OPTIONS: readonly TimeRangeOption[] = Object.freeze([
  Object.freeze({ value: TimeRanges.LAST_7_DAYS, label: "7 Days" }),
  Object.freeze({ value: TimeRanges.LAST_30_DAYS, label: "30 Days" }),
  Object.freeze({ value: TimeRanges.LAST_90_DAYS, label: "90 Days" }),
  Object.freeze({ value: TimeRanges.LAST_YEAR, label: "1 Year" }),
  Object.freeze({ value: TimeRanges.ALL_TIME, label: "All Time" }),
]);

export function isTimeRange(value: string): value is TimeRange {
  return TIME_RANGE_OPTIONS.some((option) => option.value === value);
}

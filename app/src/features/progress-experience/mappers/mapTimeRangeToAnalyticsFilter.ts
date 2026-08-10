import { AnalyticsPeriodKinds } from "../../progress-analytics/models/AnalyticsPeriod";
import type { AnalyticsFilterDto } from "../../progress-analytics/services/ProgressAnalyticsService";
import { TimeRanges, type TimeRange } from "../models";

const ANALYTICS_CATEGORIES = Object.freeze([
  "workout",
  "strength",
  "hypertrophy",
  "nutrition",
  "recovery",
  "sleep",
  "body_weight",
  "measurements",
  "consistency",
  "goals",
] as const satisfies AnalyticsFilterDto["categories"]);

const TIME_RANGE_PERIOD: Record<
  TimeRange,
  { readonly kind: AnalyticsFilterDto["period"]["kind"]; readonly label: string }
> = {
  [TimeRanges.LAST_7_DAYS]: { kind: AnalyticsPeriodKinds.WEEK, label: "Last 7 Days" },
  [TimeRanges.LAST_30_DAYS]: { kind: AnalyticsPeriodKinds.MONTH, label: "Last 30 Days" },
  [TimeRanges.LAST_90_DAYS]: { kind: AnalyticsPeriodKinds.QUARTER, label: "Last 90 Days" },
  [TimeRanges.LAST_YEAR]: { kind: AnalyticsPeriodKinds.YEAR, label: "Last Year" },
  [TimeRanges.ALL_TIME]: { kind: AnalyticsPeriodKinds.YEAR, label: "All Time" },
};

/** Maps Progress Experience time range to Progress Analytics filter contract. */
export function mapTimeRangeToAnalyticsFilter(timeRange: TimeRange): AnalyticsFilterDto {
  const period = TIME_RANGE_PERIOD[timeRange];

  return Object.freeze({
    period: Object.freeze({
      kind: period.kind,
      label: period.label,
      startDate: null,
      endDate: null,
    }),
    categories: ANALYTICS_CATEGORIES,
    includeCharts: true,
  });
}

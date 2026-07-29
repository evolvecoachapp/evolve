import type { AnalyticsCategory } from "./AnalyticsCategory";
import type { AnalyticsPeriod } from "./AnalyticsPeriod";

export interface AnalyticsFilter {
  readonly period: AnalyticsPeriod;
  readonly categories: readonly AnalyticsCategory[];
  readonly includeCharts: boolean;
}

export function createAnalyticsFilter(input: AnalyticsFilter): AnalyticsFilter {
  return Object.freeze({
    ...input,
    period: Object.freeze({ ...input.period }),
    categories: Object.freeze([...input.categories]),
  });
}

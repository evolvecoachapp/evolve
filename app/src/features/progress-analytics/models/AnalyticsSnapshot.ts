import type { AnalyticsPeriod } from "./AnalyticsPeriod";
import type { ProgressSummary } from "./ProgressSummary";

export interface AnalyticsSnapshot {
  readonly id: string;
  readonly capturedAt: string;
  readonly period: AnalyticsPeriod;
  readonly summary: ProgressSummary;
  readonly notes: string | null;
  readonly destination: string | null;
}

export function createAnalyticsSnapshot(input: AnalyticsSnapshot): AnalyticsSnapshot {
  return Object.freeze({
    ...input,
    period: Object.freeze({ ...input.period }),
    summary: Object.freeze({ ...input.summary }),
  });
}

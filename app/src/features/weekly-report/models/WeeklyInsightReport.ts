/**
 * Immutable Weekly Coach Report insight section.
 * Composed from Proactive Insights — weekly patterns, important findings, top insights.
 * Presentation only. Never invent insights.
 */
export interface WeeklyInsightItem {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly severity: string;
  readonly domain: string;
  readonly recommendation: string;
  readonly expectedOutcome: string;
}

export interface WeeklyInsightReport {
  readonly present: boolean;
  readonly criticalCount: number;
  readonly items: readonly WeeklyInsightItem[];
  readonly topInsights: readonly string[];
  readonly patternSummaries: readonly string[];
  readonly topRecommendation: string | null;
  readonly summary: string;
}

/**
 * Immutable Daily Brief insights section — composed from Proactive Insights.
 * Presentation only. Never invent insights.
 */
export interface DailyBriefInsightItem {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly severity: string;
  readonly domain: string;
  readonly recommendation: string;
  readonly expectedOutcome: string;
}

export interface DailyBriefInsights {
  readonly present: boolean;
  readonly criticalCount: number;
  readonly items: readonly DailyBriefInsightItem[];
  readonly topRecommendation: string | null;
  readonly summary: string;
}

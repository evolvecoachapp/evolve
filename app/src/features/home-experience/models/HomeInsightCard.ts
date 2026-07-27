/**
 * Immutable Home insight card — composed from Proactive Insights.
 * Presentation only. Never invent insights.
 */
export interface HomeInsightCard {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly severity: string;
  readonly domain: string;
  readonly recommendation: string;
  readonly expectedOutcome: string;
}

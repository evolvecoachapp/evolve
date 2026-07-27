/**
 * Immutable Weekly Coach Report recommendation section.
 * Composed from Explainable Coaching Session + Decision / Recommendation engines.
 * Presentation only. Never invent recommendations.
 */
export interface WeeklyRecommendationReport {
  readonly present: boolean;
  readonly sessionId: string | null;
  readonly recommendationIds: readonly string[];
  readonly titles: readonly string[];
  readonly recommendationSummary: string | null;
  readonly expectedOutcome: string | null;
  readonly focusForNextWeek: string | null;
  readonly confidenceLevel: string | null;
  readonly confidenceScore: number | null;
  readonly summary: string;
}

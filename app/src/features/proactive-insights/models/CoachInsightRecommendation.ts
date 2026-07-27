/**
 * Immutable coaching recommendation derived from evidence only.
 * Never unsupported advice.
 */
export interface CoachInsightRecommendation {
  readonly action: string;
  readonly rationale: string;
  readonly expectedOutcome: string;
  readonly relatedRecommendationId: string | null;
}

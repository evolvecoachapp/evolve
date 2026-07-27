/**
 * Immutable reason linked to Decision / Recommendation / Explainability refs.
 */
export interface CoachInsightReason {
  readonly decisionId: string | null;
  readonly recommendationId: string | null;
  readonly explanationId: string | null;
  readonly reason: string;
  readonly impact: string;
  readonly evidenceKeys: readonly string[];
}

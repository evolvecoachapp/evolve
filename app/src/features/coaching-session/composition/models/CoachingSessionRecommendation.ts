/**
 * Immutable recommendation summary composed from existing Recommendation Engine refs.
 */
export interface CoachingSessionRecommendation {
  readonly recommendationIds: readonly string[];
  readonly titles: readonly string[];
  readonly summary: string;
  readonly present: boolean;
}

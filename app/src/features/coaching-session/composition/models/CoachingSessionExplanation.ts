/**
 * Immutable reasoning / explainability summary composed from existing Explainability refs.
 */
export interface CoachingSessionExplanation {
  readonly explanationIds: readonly string[];
  readonly reasoningPoints: readonly string[];
  readonly summary: string;
  readonly present: boolean;
}

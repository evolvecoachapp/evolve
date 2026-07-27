/**
 * Explainability-linked decision reason for a timeline entry.
 * Connects Decision / Recommendation / Reason / Impact / Expected Outcome.
 */
export interface CoachDecisionReason {
  readonly decisionId: string | null;
  readonly recommendationId: string | null;
  readonly reason: string;
  readonly impact: string;
  readonly expectedOutcome: string;
  readonly evidenceKeys: readonly string[];
}

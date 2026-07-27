/**
 * Deterministic narrative summary of an explainable coaching session.
 */
export interface CoachingSessionSummary {
  readonly id: string;
  readonly headline: string;
  readonly narrative: string;
  readonly highlights: readonly string[];
  readonly generatedAt: string;
}

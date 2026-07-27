/**
 * Deterministic Home Experience summary for dashboard presentation.
 */
export interface HomeSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly headline: string;
  readonly narrative: string;
  readonly highlights: readonly string[];
  readonly presentCardCount: number;
  readonly insightCount: number;
  readonly quickActionCount: number;
  readonly generatedAt: string;
}

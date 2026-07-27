/**
 * Immutable Home coach card — composed from latest Explainable Coaching Session.
 * Presentation only. Never invent recommendations.
 */
export interface HomeCoachCard {
  readonly present: boolean;
  readonly sessionId: string | null;
  readonly recommendation: string | null;
  readonly expectedOutcome: string | null;
  readonly confidenceLevel: string | null;
  readonly confidenceScore: number | null;
  readonly headline: string | null;
  readonly summary: string;
}

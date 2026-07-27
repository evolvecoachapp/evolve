/**
 * Immutable Daily Brief coach message — composed from Explainable Coaching Session + Timeline.
 * Not a chat response. Presentation only. Never invent recommendations.
 */
export interface DailyBriefCoachMessage {
  readonly present: boolean;
  readonly sessionId: string | null;
  readonly headline: string | null;
  readonly recommendation: string | null;
  readonly expectedOutcome: string | null;
  readonly confidenceLevel: string | null;
  readonly confidenceScore: number | null;
  readonly timelineSummary: string | null;
  readonly message: string;
}

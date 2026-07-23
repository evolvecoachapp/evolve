/**
 * Compact immutable summary of a coach response.
 */
export interface CoachSummary {
  readonly responseId: string;
  readonly intent: string;
  readonly messagePreview: string;
  readonly recommendationCount: number;
  readonly warningCount: number;
  readonly actionCount: number;
  readonly insightCount: number;
  readonly questionCount: number;
  readonly citationCount: number;
  readonly confidenceScore: number;
  readonly complete: boolean;
}

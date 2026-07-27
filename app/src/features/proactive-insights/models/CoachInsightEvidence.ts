/**
 * Immutable evidence citation for a coach insight.
 * Always references existing domain facts (timeline entries, goal signals, etc.).
 */
export interface CoachInsightEvidence {
  readonly keys: readonly string[];
  readonly timelineEntryIds: readonly string[];
  readonly signalCount: number;
  readonly sourceDomains: readonly string[];
  readonly summary: string;
}

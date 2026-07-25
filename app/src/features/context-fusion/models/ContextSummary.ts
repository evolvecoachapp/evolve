import type { ContextConfidence } from "./ContextConfidence";
  import type { ContextStatistics } from "./ContextStatistics";

/**
 * Immutable human-readable fusion summary.
 */
export interface ContextSummary {
  readonly id: string;
  readonly headline: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly sourceLabels: readonly string[];
  readonly statistics: ContextStatistics;
  readonly confidence: ContextConfidence;
  readonly notes: readonly string[];
  readonly createdAt: string;
}

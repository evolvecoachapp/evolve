export type DecisionConfidenceLevel =
  | "unknown"
  | "low"
  | "medium"
  | "high"
  | "complete";

/**
 * Immutable confidence stamp derived from structural completeness only.
 */
export interface DecisionConfidence {
  readonly level: DecisionConfidenceLevel;
  readonly score: number;
  readonly evidenceCount: number;
  readonly notes: readonly string[];
}

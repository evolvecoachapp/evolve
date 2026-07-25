import type { DecisionMetadata } from "./DecisionMetadata";

/**
 * Compact immutable decision summary.
 */
export interface DecisionSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionCount: number;
  readonly candidateCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly primaryCategory: string | null;
  readonly headline: string;
  readonly focusAreas: readonly string[];
  readonly metadata: DecisionMetadata;
}

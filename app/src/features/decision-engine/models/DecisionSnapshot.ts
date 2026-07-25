import type { CoachingDecision } from "./CoachingDecision";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionSummary } from "./DecisionSummary";

/**
 * Point-in-time immutable capture of decisions.
 */
export interface DecisionSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly summary: DecisionSummary | null;
  readonly metadata: DecisionMetadata;
  readonly capturedAt: string;
}

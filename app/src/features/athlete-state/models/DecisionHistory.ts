import type { AthleteMetadata } from "./AthleteMetadata";

/**
 * Immutable decision history (representation only).
 */
export interface DecisionHistoryEntry {
  readonly id: string;
  readonly kind: string;
  readonly summary: string;
  readonly source: string;
  readonly decidedAt: string;
  readonly metadata: AthleteMetadata;
}

export interface DecisionHistory {
  readonly athleteId: string;
  readonly entries: readonly DecisionHistoryEntry[];
}

import type { HistoryContext } from "./HistoryContext";
import type { HistoryEntry } from "./HistoryEntry";
import type { HistoryMetadata } from "./HistoryMetadata";
import type { HistoryReference } from "./HistoryReference";

/**
 * Immutable chronological record of an athlete's journey.
 * Aggregates domain facts only — not persistence, analytics, AI, or UI.
 */
export interface AthleteHistory {
  readonly id: string;
  readonly athleteId: string | null;
  readonly entries: readonly HistoryEntry[];
  readonly entryCount: number;
  readonly references: readonly HistoryReference[];
  readonly context: HistoryContext;
  readonly metadata: HistoryMetadata;
  readonly builtAt: string;
  readonly frozenAt: string;
}

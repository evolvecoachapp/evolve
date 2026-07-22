import type { HistoryEntry } from "./HistoryEntry";
import type { HistoryStatistics } from "./HistoryStatistics";
import type { HistorySummary } from "./HistorySummary";

/**
 * Immutable frozen snapshot of an AthleteHistory at a point in time.
 */
export interface HistorySnapshot {
  readonly id: string;
  readonly historyId: string;
  readonly athleteId: string | null;
  readonly entries: readonly HistoryEntry[];
  readonly entryCount: number;
  readonly statistics: HistoryStatistics;
  readonly summary: HistorySummary;
  readonly firstOccurredAt: string | null;
  readonly lastOccurredAt: string | null;
  readonly createdAt: string;
  readonly frozenAt: string;
}

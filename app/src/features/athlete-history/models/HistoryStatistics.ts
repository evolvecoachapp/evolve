/**
 * Aggregate counts derived from a history entry set.
 */
export interface HistoryStatistics {
  readonly totalEntries: number;
  readonly byType: Readonly<Record<string, number>>;
  readonly byCategory: Readonly<Record<string, number>>;
  readonly referenceCount: number;
  readonly sessionCount: number;
  readonly firstOccurredAt: string | null;
  readonly lastOccurredAt: string | null;
  readonly spanMs: number | null;
}

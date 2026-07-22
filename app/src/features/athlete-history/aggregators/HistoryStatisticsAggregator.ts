import type { HistoryEntry } from "../models/HistoryEntry";
import type { HistoryStatistics } from "../models/HistoryStatistics";
import { aggregateReferences } from "../utils/aggregateReferences";
import { entryTimeBounds } from "../utils/formatting";
import { freezeStatistics } from "../utils/freezeHistory";

/**
 * Aggregate entry statistics from a history entry list.
 * One responsibility: entries → HistoryStatistics.
 */
export class HistoryStatisticsAggregator {
  aggregate(entries: readonly HistoryEntry[]): HistoryStatistics {
    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const sessions = new Set<string>();

    for (const entry of entries) {
      byType[entry.type] = (byType[entry.type] ?? 0) + 1;
      byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;
      if (entry.context.sessionId) {
        sessions.add(entry.context.sessionId);
      }
    }

    const bounds = entryTimeBounds(entries);
    let spanMs: number | null = null;
    if (bounds.firstOccurredAt && bounds.lastOccurredAt) {
      const first = Date.parse(bounds.firstOccurredAt);
      const last = Date.parse(bounds.lastOccurredAt);
      if (!Number.isNaN(first) && !Number.isNaN(last) && last >= first) {
        spanMs = last - first;
      }
    }

    return freezeStatistics({
      totalEntries: entries.length,
      byType: Object.freeze({ ...byType }),
      byCategory: Object.freeze({ ...byCategory }),
      referenceCount: aggregateReferences(entries).length,
      sessionCount: sessions.size,
      firstOccurredAt: bounds.firstOccurredAt,
      lastOccurredAt: bounds.lastOccurredAt,
      spanMs,
    });
  }
}

export function createHistoryStatisticsAggregator(): HistoryStatisticsAggregator {
  return new HistoryStatisticsAggregator();
}

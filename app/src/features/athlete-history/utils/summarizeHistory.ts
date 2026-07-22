import type { HistoryEntry } from "../models/HistoryEntry";
import type { HistorySummary } from "../models/HistorySummary";
import {
  buildSummaryText,
  countImplementedEntryTypes,
  entryTimeBounds,
  uniqueCategories,
  uniqueTypes,
} from "./formatting";
import { freezeSummary } from "./freezeHistory";

/**
 * Build a HistorySummary from an entry list.
 */
export function summarizeHistoryEntries(
  historyId: string,
  athleteId: string | null,
  entries: readonly HistoryEntry[],
): HistorySummary {
  const counts = countImplementedEntryTypes(entries);
  const bounds = entryTimeBounds(entries);

  return freezeSummary({
    historyId,
    athleteId,
    entryCount: entries.length,
    workoutCount: counts.workoutCount,
    performanceCount: counts.performanceCount,
    achievementCount: counts.achievementCount,
    categories: uniqueCategories(entries),
    types: uniqueTypes(entries),
    firstOccurredAt: bounds.firstOccurredAt,
    lastOccurredAt: bounds.lastOccurredAt,
    summaryText: buildSummaryText({
      entryCount: entries.length,
      ...counts,
    }),
  });
}

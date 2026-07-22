import { HistoryEntryTypes } from "../../athlete-history/models/HistoryEntryType";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { HistoryEntry } from "../../athlete-history/models/HistoryEntry";
import type { PerformanceHistoryEntry } from "../../athlete-history/models/PerformanceHistoryEntry";
import { daysToMs, parseTimestamp } from "./formatting";

function isPerformanceEntry(
  entry: HistoryEntry,
): entry is PerformanceHistoryEntry {
  return entry.type === HistoryEntryTypes.PERFORMANCE && "tonnage" in entry;
}

/**
 * Entries whose occurredAt falls within [windowStartMs, windowEndMs].
 */
export function entriesInWindow(
  entries: readonly HistoryEntry[],
  windowEndMs: number,
  windowDays: number,
): readonly HistoryEntry[] {
  const windowStartMs = windowEndMs - daysToMs(windowDays);
  return Object.freeze(
    entries.filter((entry) => {
      const occurred = parseTimestamp(entry.occurredAt);
      if (occurred === null) {
        return false;
      }
      return occurred >= windowStartMs && occurred <= windowEndMs;
    }),
  );
}

export function countWorkoutsInWindow(
  history: AthleteHistory,
  analyzedAt: string,
  windowDays: number,
): number {
  const endMs = parseTimestamp(analyzedAt);
  if (endMs === null) {
    return 0;
  }
  return entriesInWindow(history.entries, endMs, windowDays).filter(
    (entry) => entry.type === HistoryEntryTypes.WORKOUT,
  ).length;
}

export function performanceEntriesInWindow(
  history: AthleteHistory,
  analyzedAt: string,
  windowDays: number,
): readonly PerformanceHistoryEntry[] {
  const endMs = parseTimestamp(analyzedAt);
  if (endMs === null) {
    return Object.freeze([]);
  }
  return Object.freeze(
    entriesInWindow(history.entries, endMs, windowDays).filter(
      isPerformanceEntry,
    ),
  );
}

export function sumTonnage(
  entries: readonly PerformanceHistoryEntry[],
): number {
  return entries.reduce((sum, entry) => sum + (entry.tonnage ?? 0), 0);
}

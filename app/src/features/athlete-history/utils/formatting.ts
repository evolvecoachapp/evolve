import type { HistoryEntry } from "../models/HistoryEntry";
import { HistoryEntryTypes } from "../models/HistoryEntryType";

/**
 * Format a compact human-readable line for a history entry.
 */
export function formatHistoryEntry(entry: HistoryEntry): string {
  return `[${entry.occurredAt}] ${entry.type}: ${entry.title}`;
}

/**
 * Count entries of a given type.
 */
export function countEntriesByType(
  entries: readonly HistoryEntry[],
  type: string,
): number {
  return entries.filter((e) => e.type === type).length;
}

/**
 * Count workout / performance / achievement entries.
 */
export function countImplementedEntryTypes(entries: readonly HistoryEntry[]): {
  readonly workoutCount: number;
  readonly performanceCount: number;
  readonly achievementCount: number;
} {
  return Object.freeze({
    workoutCount: countEntriesByType(entries, HistoryEntryTypes.WORKOUT),
    performanceCount: countEntriesByType(
      entries,
      HistoryEntryTypes.PERFORMANCE,
    ),
    achievementCount: countEntriesByType(
      entries,
      HistoryEntryTypes.ACHIEVEMENT,
    ),
  });
}

/**
 * Unique sorted category list from entries.
 */
export function uniqueCategories(
  entries: readonly HistoryEntry[],
): readonly string[] {
  return Object.freeze([...new Set(entries.map((e) => e.category))].sort());
}

/**
 * Unique sorted type list from entries.
 */
export function uniqueTypes(
  entries: readonly HistoryEntry[],
): readonly string[] {
  return Object.freeze([...new Set(entries.map((e) => e.type))].sort());
}

/**
 * First / last occurredAt from a chronological or unsorted list.
 */
export function entryTimeBounds(entries: readonly HistoryEntry[]): {
  readonly firstOccurredAt: string | null;
  readonly lastOccurredAt: string | null;
} {
  if (entries.length === 0) {
    return Object.freeze({ firstOccurredAt: null, lastOccurredAt: null });
  }
  let first = entries[0].occurredAt;
  let last = entries[0].occurredAt;
  for (const entry of entries) {
    if (entry.occurredAt < first) {
      first = entry.occurredAt;
    }
    if (entry.occurredAt > last) {
      last = entry.occurredAt;
    }
  }
  return Object.freeze({ firstOccurredAt: first, lastOccurredAt: last });
}

/**
 * Build default summary text from entry counts.
 */
export function buildSummaryText(counts: {
  readonly entryCount: number;
  readonly workoutCount: number;
  readonly performanceCount: number;
  readonly achievementCount: number;
}): string {
  if (counts.entryCount === 0) {
    return "No history entries";
  }
  return `${counts.entryCount} history entr${counts.entryCount === 1 ? "y" : "ies"} (${counts.workoutCount} workout, ${counts.performanceCount} performance, ${counts.achievementCount} achievement)`;
}

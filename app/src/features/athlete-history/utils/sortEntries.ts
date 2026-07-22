import type { HistoryEntry } from "../models/HistoryEntry";

/**
 * Sort history entries chronologically: occurredAt asc, then id asc.
 */
export function sortHistoryEntries(
  entries: readonly HistoryEntry[],
): readonly HistoryEntry[] {
  return Object.freeze(
    [...entries].sort((a, b) => {
      const timeDiff = a.occurredAt.localeCompare(b.occurredAt);
      if (timeDiff !== 0) {
        return timeDiff;
      }
      return a.id.localeCompare(b.id);
    }),
  );
}

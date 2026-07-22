import type { HistoryEntry } from "../models/HistoryEntry";
import { historyEntryIdentity } from "../utils/normalizeHistory";

/**
 * Detect duplicate history entries within a candidate list.
 */
export function validateDuplicates(
  entries: readonly HistoryEntry[],
): readonly string[] {
  const seen = new Set<string>();
  const issues: string[] = [];

  for (const entry of entries) {
    const key = historyEntryIdentity(entry);
    if (seen.has(key)) {
      issues.push(`duplicate_entry:${key}`);
      continue;
    }
    seen.add(key);
  }

  return Object.freeze(issues);
}

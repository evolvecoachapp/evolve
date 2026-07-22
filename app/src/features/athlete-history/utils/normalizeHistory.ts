import type { HistoryEntry } from "../models/HistoryEntry";
import { freezeHistoryEntry } from "./freezeHistory";
import { sortHistoryEntries } from "./sortEntries";

/**
 * Stable identity for deduplication.
 */
export function historyEntryIdentity(entry: HistoryEntry): string {
  return `${entry.type}:${entry.id}`;
}

/**
 * Deduplicate entries by identity, preserving first occurrence order.
 */
export function dedupeHistoryEntries(
  entries: readonly HistoryEntry[],
): readonly HistoryEntry[] {
  const seen = new Set<string>();
  const result: HistoryEntry[] = [];

  for (const entry of entries) {
    const key = historyEntryIdentity(entry);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(entry);
  }

  return Object.freeze(result);
}

/**
 * Normalize: dedupe → chronological sort → freeze.
 */
export function normalizeHistoryEntries(
  entries: readonly HistoryEntry[],
): readonly HistoryEntry[] {
  return Object.freeze(
    sortHistoryEntries(dedupeHistoryEntries(entries)).map((e) =>
      freezeHistoryEntry(e),
    ),
  );
}

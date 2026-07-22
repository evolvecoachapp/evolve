import type { HistoryEntry } from "../models/HistoryEntry";
import type { HistoryReference } from "../models/HistoryReference";

function referenceKey(ref: HistoryReference): string {
  return `${ref.kind}:${ref.id}`;
}

/**
 * Aggregate unique references across history entries (stable order).
 */
export function aggregateReferences(
  entries: readonly HistoryEntry[],
): readonly HistoryReference[] {
  const seen = new Set<string>();
  const refs: HistoryReference[] = [];

  for (const entry of entries) {
    for (const ref of entry.references) {
      const key = referenceKey(ref);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      refs.push(Object.freeze({ ...ref }));
    }
  }

  return Object.freeze(refs);
}

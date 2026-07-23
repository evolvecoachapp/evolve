import type { MemoryEntry } from "../models/MemoryEntry";

/**
 * Deterministic sort: priority desc, updatedAt desc, id asc.
 */
export function compareEntriesByPriorityThenTime(
  a: MemoryEntry,
  b: MemoryEntry,
): number {
  if (a.priority !== b.priority) return b.priority - a.priority;
  if (a.updatedAt !== b.updatedAt) {
    return a.updatedAt < b.updatedAt ? 1 : -1;
  }
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}

export function sortEntriesDeterministic(
  entries: readonly MemoryEntry[],
): readonly MemoryEntry[] {
  return Object.freeze(
    [...entries].sort(compareEntriesByPriorityThenTime),
  );
}

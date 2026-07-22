import type { HistoryEntry } from "../models/HistoryEntry";

const ISO_TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

/**
 * Validate that entries are in chronological order (occurredAt asc, id asc ties).
 */
export function validateChronologicalOrder(
  entries: readonly HistoryEntry[],
): readonly string[] {
  const issues: string[] = [];

  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1];
    const curr = entries[i];
    const cmp = prev.occurredAt.localeCompare(curr.occurredAt);
    if (cmp > 0) {
      issues.push(`chronology_violation:${prev.id}->${curr.id}`);
    } else if (cmp === 0 && prev.id.localeCompare(curr.id) > 0) {
      issues.push(`chronology_id_tie_violation:${prev.id}->${curr.id}`);
    }
  }

  return Object.freeze(issues);
}

/**
 * Validate ISO-like timestamps on entries.
 */
export function validateTimestamps(
  entries: readonly HistoryEntry[],
): readonly string[] {
  const issues: string[] = [];

  for (const entry of entries) {
    if (!entry.occurredAt || !ISO_TIMESTAMP.test(entry.occurredAt)) {
      issues.push(`invalid_occurred_at:${entry.id}`);
    } else if (Number.isNaN(Date.parse(entry.occurredAt))) {
      issues.push(`unparseable_occurred_at:${entry.id}`);
    }

    if (!entry.frozenAt || !ISO_TIMESTAMP.test(entry.frozenAt)) {
      issues.push(`invalid_frozen_at:${entry.id}`);
    }
  }

  return Object.freeze(issues);
}

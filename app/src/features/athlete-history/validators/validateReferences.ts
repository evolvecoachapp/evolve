import type { HistoryEntry } from "../models/HistoryEntry";

/**
 * Validate that entry references have kind + id.
 */
export function validateReferences(
  entries: readonly HistoryEntry[],
): readonly string[] {
  const issues: string[] = [];

  for (const entry of entries) {
    for (const ref of entry.references) {
      if (!ref.kind || !ref.id) {
        issues.push(`broken_reference:${entry.id}`);
      }
    }

    if (!entry.evidence?.sourceType || !entry.evidence?.sourceId) {
      issues.push(`broken_evidence:${entry.id}`);
    }
  }

  return Object.freeze(issues);
}

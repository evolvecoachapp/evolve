import type { HistoryEntry } from "../models/HistoryEntry";
import { HistoryEntryCategories } from "../models/HistoryEntryCategory";
import { HistoryEntryTypes } from "../models/HistoryEntryType";

const KNOWN_TYPES = new Set<string>(Object.values(HistoryEntryTypes));
const KNOWN_CATEGORIES = new Set<string>(
  Object.values(HistoryEntryCategories),
);

/**
 * Soft-validate categories and types.
 * Unknown values are allowed (extensibility) but empty values are invalid.
 * Implemented entry types must use their expected category.
 */
export function validateCategories(
  entries: readonly HistoryEntry[],
): readonly string[] {
  const issues: string[] = [];

  for (const entry of entries) {
    if (!entry.type) {
      issues.push(`missing_type:${entry.id}`);
    }
    if (!entry.category) {
      issues.push(`missing_category:${entry.id}`);
    }

    if (entry.type === HistoryEntryTypes.WORKOUT) {
      if (entry.category !== HistoryEntryCategories.TRAINING) {
        issues.push(`invalid_category_for_type:${entry.id}:workout`);
      }
    } else if (entry.type === HistoryEntryTypes.PERFORMANCE) {
      if (entry.category !== HistoryEntryCategories.PERFORMANCE) {
        issues.push(`invalid_category_for_type:${entry.id}:performance`);
      }
    } else if (entry.type === HistoryEntryTypes.ACHIEVEMENT) {
      if (entry.category !== HistoryEntryCategories.ACHIEVEMENT) {
        issues.push(`invalid_category_for_type:${entry.id}:achievement`);
      }
    } else if (entry.type && !KNOWN_TYPES.has(entry.type)) {
      // Future / unknown types are allowed — no issue.
      void KNOWN_CATEGORIES;
    }
  }

  return Object.freeze(issues);
}

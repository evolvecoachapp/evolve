import type { CoachTimelineEntry } from "../models/CoachTimelineEntry";
import type { TimelineFilter } from "../models/TimelineFilter";

function matchesSearch(
  entry: CoachTimelineEntry,
  searchText: string,
): boolean {
  const needle = searchText.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    entry.summary,
    entry.explanation,
    entry.decisionReason.reason,
    entry.decisionReason.impact,
    entry.decisionReason.expectedOutcome,
    entry.event.label,
    entry.event.category,
    ...Object.values(entry.metadata),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

/**
 * Filter timeline entries by immutable criteria. One responsibility only.
 */
export function filterTimeline(
  entries: readonly CoachTimelineEntry[],
  filter: TimelineFilter | null | undefined,
): readonly CoachTimelineEntry[] {
  if (!filter) {
    return Object.freeze([...entries]);
  }

  const categories = filter.categories
    ? new Set(filter.categories)
    : null;
  const domains = filter.domains ? new Set(filter.domains) : null;

  return Object.freeze(
    entries.filter((entry) => {
      if (categories && !categories.has(entry.event.category)) return false;
      if (domains && !domains.has(entry.affectedDomain)) return false;
      if (
        filter.conversationId != null &&
        entry.conversationId !== filter.conversationId
      ) {
        return false;
      }
      if (
        filter.lineageId != null &&
        entry.relatedPlanLineageId !== filter.lineageId
      ) {
        return false;
      }
      if (
        filter.fromTimestamp != null &&
        entry.timestamp < filter.fromTimestamp
      ) {
        return false;
      }
      if (
        filter.toTimestamp != null &&
        entry.timestamp > filter.toTimestamp
      ) {
        return false;
      }
      if (
        filter.minConfidence != null &&
        entry.confidence < filter.minConfidence
      ) {
        return false;
      }
      if (
        filter.searchText != null &&
        !matchesSearch(entry, filter.searchText)
      ) {
        return false;
      }
      return true;
    }),
  );
}

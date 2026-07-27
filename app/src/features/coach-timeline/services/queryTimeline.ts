import type { CoachTimelineEntry } from "../models/CoachTimelineEntry";
import type { TimelineQuery } from "../models/TimelineQuery";
import type { TimelineResult } from "../models/TimelineResult";
import type { CoachTimelineStore } from "../store/CoachTimelineStore";
import { buildTimelineSummary } from "./buildTimelineSummary";
import { filterTimeline } from "./filterTimeline";

/**
 * Query the Coach Timeline with optional filter + summary. One responsibility only.
 */
export function queryTimeline(input: {
  readonly store: CoachTimelineStore;
  readonly query: TimelineQuery;
  readonly generatedAt: string;
}): TimelineResult {
  const timeline = input.store.getTimeline(input.query.athleteId);
  if (!timeline) {
    return Object.freeze({
      query: input.query,
      timeline: null,
      entries: Object.freeze([] as CoachTimelineEntry[]),
      summary: null,
      matchedCount: 0,
      success: true,
      message: "No timeline entries for athlete",
    });
  }

  let entries = filterTimeline(timeline.entries, input.query.filter);

  const order = input.query.order ?? "asc";
  const sorted = [...entries].sort((a, b) => {
    if (a.timestamp === b.timestamp) {
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    }
    return a.timestamp < b.timestamp ? -1 : 1;
  });
  if (order === "desc") sorted.reverse();

  if (typeof input.query.limit === "number" && input.query.limit >= 0) {
    entries = Object.freeze(sorted.slice(0, input.query.limit));
  } else {
    entries = Object.freeze(sorted);
  }

  const summary = input.query.summaryKind
    ? buildTimelineSummary({
        entries: timeline.entries,
        kind: input.query.summaryKind,
        generatedAt: input.generatedAt,
      })
    : null;

  return Object.freeze({
    query: input.query,
    timeline,
    entries,
    summary,
    matchedCount: entries.length,
    success: true,
    message:
      entries.length > 0
        ? `Matched ${entries.length} timeline entr${entries.length === 1 ? "y" : "ies"}`
        : "No timeline entries matched the query",
  });
}

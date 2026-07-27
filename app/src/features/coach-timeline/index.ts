/**
 * Coach Timeline & Decision Journal (Sprint 25.4).
 *
 * Chronological reasoning history of the AI Coach.
 * Not chat history. Not an event log. Not analytics.
 * Append-only. Immutable entries. No persistence. No event bus.
 */

export * from "./models";
export {
  CoachTimelineStore,
  createCoachTimelineStore,
} from "./store/CoachTimelineStore";
export * from "./services";
export * from "./builders";
export {
  appendTimelineEntry,
  queryTimeline,
  buildTimelineSummary,
  getCoachTimeline,
} from "./application";

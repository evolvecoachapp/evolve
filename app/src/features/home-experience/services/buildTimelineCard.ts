import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import type {
  HomeTimelineCard,
  HomeTimelineEventRef,
} from "../models/HomeTimelineCard";

export interface BuildTimelineCardInput {
  readonly timelineEntries?: readonly CoachTimelineEntry[];
  readonly limit?: number;
}

function toRef(entry: CoachTimelineEntry): HomeTimelineEventRef {
  return Object.freeze({
    id: entry.id,
    category: entry.event.category,
    summary: entry.summary,
    timestamp: entry.timestamp,
    domain: entry.affectedDomain,
  });
}

/**
 * Compose Home timeline card from Coach Timeline journal.
 * Surfaces recent decisions, modifications, and restore events.
 * No duplicated timeline logic.
 */
export function buildTimelineCard(
  input: BuildTimelineCardInput = {},
): HomeTimelineCard {
  const entries = input.timelineEntries ?? Object.freeze([]);
  const limit = input.limit ?? 5;

  if (entries.length === 0) {
    return Object.freeze({
      present: false,
      recentDecisions: Object.freeze([]),
      latestModifications: Object.freeze([]),
      restoreEvents: Object.freeze([]),
      entryCount: 0,
      summary: "No timeline events.",
    });
  }

  const sorted = [...entries].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );

  const recentDecisions = Object.freeze(
    sorted
      .filter(
        (e) =>
          e.event.category === CoachTimelineEventCategories.COACH_DECISION ||
          e.decisionReason.decisionId !== null,
      )
      .slice(0, limit)
      .map(toRef),
  );

  const latestModifications = Object.freeze(
    sorted
      .filter(
        (e) =>
          e.event.category === CoachTimelineEventCategories.WORKOUT_MODIFIED ||
          e.event.category === CoachTimelineEventCategories.NUTRITION_MODIFIED ||
          e.event.category ===
            CoachTimelineEventCategories.PROGRAM_PHASE_CHANGED,
      )
      .slice(0, limit)
      .map(toRef),
  );

  const restoreEvents = Object.freeze(
    sorted
      .filter(
        (e) =>
          e.event.category === CoachTimelineEventCategories.WORKOUT_RESTORED ||
          e.event.category === CoachTimelineEventCategories.NUTRITION_RESTORED,
      )
      .slice(0, limit)
      .map(toRef),
  );

  return Object.freeze({
    present: true,
    recentDecisions,
    latestModifications,
    restoreEvents,
    entryCount: entries.length,
    summary: `${entries.length} timeline events · ${recentDecisions.length} decisions · ${latestModifications.length} modifications · ${restoreEvents.length} restores`,
  });
}

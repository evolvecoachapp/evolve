import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import type { CoachTimeline } from "../../coach-timeline/models/CoachTimeline";
import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import type { SnapshotTimeline } from "../models/SnapshotTimeline";

export interface BuildTimelineProjectionInput {
  readonly athleteId: string;
  readonly timeline?: CoachTimeline | null;
  readonly latestEvents?: readonly CoachTimelineEntry[];
  readonly latestDecisions?: readonly CoachTimelineEntry[];
  readonly latestRestores?: readonly CoachTimelineEntry[];
}

function latestEntries(
  entries: readonly CoachTimelineEntry[],
  limit: number,
): readonly CoachTimelineEntry[] {
  return Object.freeze(entries.slice(-limit).reverse());
}

function latestDecisionEntries(
  entries: readonly CoachTimelineEntry[],
  limit: number,
): readonly CoachTimelineEntry[] {
  return Object.freeze(
    entries
      .filter((entry) => entry.affectedDomain === "decision")
      .slice(-limit)
      .reverse(),
  );
}

function latestRestoreEntries(
  entries: readonly CoachTimelineEntry[],
  limit: number,
): readonly CoachTimelineEntry[] {
  return Object.freeze(
    entries
      .filter((entry) => {
        const category = entry.event.category;
        return (
          category === CoachTimelineEventCategories.WORKOUT_RESTORED ||
          category === CoachTimelineEventCategories.NUTRITION_RESTORED
        );
      })
      .slice(-limit)
      .reverse(),
  );
}

/**
 * Projects Coach Timeline references into the athlete snapshot.
 */
export function buildTimelineProjection(
  input: BuildTimelineProjectionInput,
): SnapshotTimeline {
  const timeline = input.timeline ?? null;
  const entries = timeline?.entries ?? Object.freeze([]);

  return Object.freeze({
    athleteId: input.athleteId,
    present: timeline != null,
    timeline,
    latestEvents: input.latestEvents ?? latestEntries(entries, 10),
    latestDecisions: input.latestDecisions ?? latestDecisionEntries(entries, 10),
    latestRestores: input.latestRestores ?? latestRestoreEntries(entries, 10),
  });
}

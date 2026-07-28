import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import type { CoachTimeline } from "../../coach-timeline/models/CoachTimeline";
import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import type { WorkspaceTimeline } from "../models/WorkspaceTimeline";

export interface BuildWorkspaceTimelineInput {
  readonly athleteId: string;
  readonly timeline?: CoachTimeline | null;
  readonly latestEvents?: readonly CoachTimelineEntry[];
  readonly latestDecisions?: readonly CoachTimelineEntry[];
  readonly latestRestores?: readonly CoachTimelineEntry[];
}

function filterDecisions(
  timeline: CoachTimeline | null,
  limit: number,
): readonly CoachTimelineEntry[] {
  return Object.freeze(
    (timeline?.entries ?? [])
      .filter((entry) => entry.affectedDomain === "decision")
      .slice(-limit)
      .reverse(),
  );
}

function filterRestores(
  timeline: CoachTimeline | null,
  limit: number,
): readonly CoachTimelineEntry[] {
  return Object.freeze(
    (timeline?.entries ?? [])
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
 * Builds timeline projection from Coach Timeline.
 */
export function buildWorkspaceTimeline(
  input: BuildWorkspaceTimelineInput,
): WorkspaceTimeline {
  const timeline = input.timeline ?? null;
  const entries = timeline?.entries ?? Object.freeze([]);
  const latestEvents =
    input.latestEvents ??
    Object.freeze(entries.slice(-10).reverse());
  const latestDecisions =
    input.latestDecisions ?? filterDecisions(timeline, 10);
  const latestRestores =
    input.latestRestores ?? filterRestores(timeline, 10);
  const latestEventAt =
    entries.length > 0
      ? entries[entries.length - 1]?.timestamp ?? null
      : null;

  return Object.freeze({
    athleteId: input.athleteId,
    present: timeline != null,
    timeline,
    latestEvents,
    latestDecisions,
    latestRestores,
    entryCount: timeline?.entryCount ?? entries.length,
    latestEventAt,
  });
}

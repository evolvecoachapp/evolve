import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import type { AthleteTimeline } from "../models/AthleteTimeline";
import type { StateChange } from "../models/StateChange";
import { freezeTimeline } from "../utils/FreezeAthleteState";

export function buildEmptyTimeline(athleteId: string): AthleteTimeline {
  return freezeTimeline({
    athleteId,
    items: Object.freeze([]),
    metadata: EMPTY_ATHLETE_METADATA,
  });
}

export function appendTimelineChange(input: {
  readonly timeline: AthleteTimeline;
  readonly change: StateChange;
  readonly itemId: string;
}): AthleteTimeline {
  const sequence = input.timeline.items.length + 1;
  return freezeTimeline({
    athleteId: input.timeline.athleteId,
    items: Object.freeze([
      ...input.timeline.items,
      Object.freeze({
        id: input.itemId,
        sequence,
        change: input.change,
        occurredAt: input.change.changedAt,
      }),
    ]),
    metadata: input.timeline.metadata,
  });
}

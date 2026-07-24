import type { AthleteState } from "../models/AthleteState";
import type { AthleteTimeline, AthleteTimelineItem } from "../models/AthleteTimeline";

export function selectTimeline(state: AthleteState): AthleteTimeline {
  return state.timeline;
}

export function selectLatestTimelineItem(
  state: AthleteState,
): AthleteTimelineItem | null {
  return state.timeline.items[state.timeline.items.length - 1] ?? null;
}

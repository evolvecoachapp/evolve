import type { AthleteMetadata } from "./AthleteMetadata";
import type { StateChange } from "./StateChange";

export interface AthleteTimelineItem {
  readonly id: string;
  readonly sequence: number;
  readonly change: StateChange;
  readonly occurredAt: string;
}

/**
 * Immutable athlete state timeline.
 */
export interface AthleteTimeline {
  readonly athleteId: string;
  readonly items: readonly AthleteTimelineItem[];
  readonly metadata: AthleteMetadata;
}

import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthleteState } from "./AthleteState";
import type { AthleteTimeline } from "./AthleteTimeline";
import type { StateSummary } from "./StateSummary";
import type { StateVersion } from "./StateVersion";

/**
 * Immutable point-in-time snapshot of athlete state.
 */
export interface AthleteSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly version: StateVersion;
  readonly state: AthleteState;
  readonly summary: StateSummary | null;
  readonly timeline: AthleteTimeline | null;
  readonly metadata: AthleteMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}

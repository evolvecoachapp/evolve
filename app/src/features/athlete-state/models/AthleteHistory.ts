import type { AthleteMetadata } from "./AthleteMetadata";
import type { StateChange } from "./StateChange";

export interface AthleteHistoryEntry {
  readonly id: string;
  readonly change: StateChange;
  readonly recordedAt: string;
}

/**
 * Immutable athlete state history.
 */
export interface AthleteHistory {
  readonly athleteId: string;
  readonly entries: readonly AthleteHistoryEntry[];
  readonly metadata: AthleteMetadata;
}

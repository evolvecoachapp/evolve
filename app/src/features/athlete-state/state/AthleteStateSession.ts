import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { AthleteState } from "../models/AthleteState";

/**
 * In-memory session handle for a single athlete's state (no persistence).
 */
export interface AthleteStateSession {
  readonly athleteId: string;
  readonly state: AthleteState;
  readonly snapshots: readonly AthleteSnapshot[];
}

export function createAthleteStateSession(input: {
  readonly state: AthleteState;
  readonly snapshots?: readonly AthleteSnapshot[];
}): AthleteStateSession {
  return Object.freeze({
    athleteId: input.state.athleteId,
    state: input.state,
    snapshots: Object.freeze([...(input.snapshots ?? [])]),
  });
}

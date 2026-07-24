import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import type { AthleteHistory } from "../models/AthleteHistory";
import type { StateChange } from "../models/StateChange";
import { freezeHistory } from "../utils/FreezeAthleteState";

export function aggregateHistory(input: {
  readonly current: AthleteHistory;
  readonly change: StateChange;
  readonly entryId: string;
}): AthleteHistory {
  return freezeHistory({
    athleteId: input.current.athleteId,
    entries: Object.freeze([
      ...input.current.entries,
      Object.freeze({
        id: input.entryId,
        change: input.change,
        recordedAt: input.change.changedAt,
      }),
    ]),
    metadata: input.current.metadata ?? EMPTY_ATHLETE_METADATA,
  });
}

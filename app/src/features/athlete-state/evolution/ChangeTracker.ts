import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import {
  StateChangeKinds,
  type StateChange,
  type StateChangeKind,
} from "../models/StateChange";
import type { StateVersion } from "../models/StateVersion";
import { freezeChange } from "../utils/FreezeAthleteState";

export function trackStateChange(input: {
  readonly id: string;
  readonly kind?: StateChangeKind;
  readonly athleteId: string;
  readonly fromVersion: StateVersion | null;
  readonly toVersion: StateVersion;
  readonly paths: readonly string[];
  readonly summary: string;
  readonly source: string;
  readonly changedAt: string;
}): StateChange {
  return freezeChange({
    id: input.id,
    kind: input.kind ?? StateChangeKinds.UPDATE,
    athleteId: input.athleteId,
    fromVersion: input.fromVersion,
    toVersion: input.toVersion,
    paths: Object.freeze([...input.paths]),
    summary: input.summary,
    source: input.source,
    metadata: EMPTY_ATHLETE_METADATA,
    changedAt: input.changedAt,
  });
}

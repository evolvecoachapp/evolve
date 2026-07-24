import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { AthleteState } from "../models/AthleteState";
import type { AthleteTimeline } from "../models/AthleteTimeline";
import type { StateSummary } from "../models/StateSummary";
import { freezeSnapshot } from "../utils/FreezeAthleteState";

export function buildAthleteSnapshot(input: {
  readonly id: string;
  readonly state: AthleteState;
  readonly summary?: StateSummary | null;
  readonly timeline?: AthleteTimeline | null;
  readonly createdAt: string;
}): AthleteSnapshot {
  return freezeSnapshot({
    id: input.id,
    athleteId: input.state.athleteId,
    version: input.state.version,
    state: input.state,
    summary: input.summary ?? input.state.summary,
    timeline: input.timeline ?? input.state.timeline,
    metadata: EMPTY_ATHLETE_METADATA,
    createdAt: input.createdAt,
    frozenAt: input.createdAt,
  });
}

import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { AthleteState } from "../models/AthleteState";
import type { CoachSupervisorContext } from "../models/CoachSupervisorContext";
import type { StateSummary } from "../models/StateSummary";
import { freezeSupervisorContext } from "../utils/FreezeAthleteState";

export function buildCoachSupervisorContext(input: {
  readonly state: AthleteState;
  readonly snapshot?: AthleteSnapshot | null;
  readonly summary?: StateSummary | null;
  readonly createdAt: string;
}): CoachSupervisorContext {
  return freezeSupervisorContext({
    athleteId: input.state.athleteId,
    state: input.state,
    snapshot: input.snapshot ?? null,
    summary: input.summary ?? input.state.summary,
    focusAreas: input.state.coaching.focusAreas,
    metadata: EMPTY_ATHLETE_METADATA,
    createdAt: input.createdAt,
  });
}

import type { TrainingState } from "../models/TrainingState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeTraining } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

export function aggregateTraining(input: {
  readonly current: TrainingState;
  readonly contributions: readonly SpecialistContribution[];
}): TrainingState {
  let next = input.current;
  for (const c of input.contributions) {
    if (!c.training) continue;
    next = freezeTraining({
      phase: c.training.phase ?? next.phase,
      focus: c.training.focus ?? next.focus,
      sessionsPerWeek: c.training.sessionsPerWeek ?? next.sessionsPerWeek,
      lastSessionId: c.training.lastSessionId ?? next.lastSessionId,
      lastSessionAt: c.training.lastSessionAt ?? next.lastSessionAt,
      programId: c.training.programId ?? next.programId,
      notes: mergeUniqueStrings(next.notes, c.training.notes),
      sourceAgentIds: mergeUniqueStrings(
        next.sourceAgentIds,
        c.training.sourceAgentIds,
        [c.agentId],
      ),
    });
  }
  return next;
}

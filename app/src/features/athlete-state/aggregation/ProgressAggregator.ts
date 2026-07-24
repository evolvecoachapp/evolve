import type { ProgressState } from "../models/ProgressState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeProgress } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

export function aggregateProgress(input: {
  readonly current: ProgressState;
  readonly contributions: readonly SpecialistContribution[];
}): ProgressState {
  let next = input.current;
  for (const c of input.contributions) {
    if (!c.progress) continue;
    next = freezeProgress({
      milestones: mergeUniqueStrings(next.milestones, c.progress.milestones),
      recentWins: mergeUniqueStrings(next.recentWins, c.progress.recentWins),
      blockers: mergeUniqueStrings(next.blockers, c.progress.blockers),
      notes: mergeUniqueStrings(next.notes, c.progress.notes),
      sourceAgentIds: mergeUniqueStrings(
        next.sourceAgentIds,
        c.progress.sourceAgentIds,
        [c.agentId],
      ),
    });
  }
  return next;
}

import type { PerformanceState } from "../models/PerformanceState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezePerformance } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

export function aggregatePerformance(input: {
  readonly current: PerformanceState;
  readonly contributions: readonly SpecialistContribution[];
}): PerformanceState {
  let next = input.current;
  for (const c of input.contributions) {
    if (!c.performance) continue;
    next = freezePerformance({
      lastSnapshotId: c.performance.lastSnapshotId ?? next.lastSnapshotId,
      trendLabel: c.performance.trendLabel ?? next.trendLabel,
      highlights: mergeUniqueStrings(next.highlights, c.performance.highlights),
      notes: mergeUniqueStrings(next.notes, c.performance.notes),
      sourceAgentIds: mergeUniqueStrings(
        next.sourceAgentIds,
        c.performance.sourceAgentIds,
        [c.agentId],
      ),
    });
  }
  return next;
}

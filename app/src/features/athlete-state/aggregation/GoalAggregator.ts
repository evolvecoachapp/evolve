import type { AthleteGoals } from "../models/AthleteGoals";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeGoals } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

export function aggregateGoals(input: {
  readonly current: AthleteGoals;
  readonly contributions: readonly SpecialistContribution[];
}): AthleteGoals {
  let next = input.current;
  for (const c of input.contributions) {
    if (!c.goals) continue;
    const byId = new Map(next.items.map((g) => [g.id, g]));
    for (const item of c.goals.items) {
      byId.set(item.id, item);
    }
    next = freezeGoals({
      primaryGoalId: c.goals.primaryGoalId ?? next.primaryGoalId,
      items: Object.freeze([...byId.values()]),
      sourceAgentIds: mergeUniqueStrings(
        next.sourceAgentIds,
        c.goals.sourceAgentIds,
        [c.agentId],
      ),
    });
  }
  return next;
}

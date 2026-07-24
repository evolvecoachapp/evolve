import type { RecoveryState } from "../models/RecoveryState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeRecovery } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

export function aggregateRecovery(input: {
  readonly current: RecoveryState;
  readonly contributions: readonly SpecialistContribution[];
}): RecoveryState {
  let next = input.current;
  for (const c of input.contributions) {
    if (!c.recovery) continue;
    next = freezeRecovery({
      status: c.recovery.status ?? next.status,
      lastRecoverySessionId:
        c.recovery.lastRecoverySessionId ?? next.lastRecoverySessionId,
      lastAssessedAt: c.recovery.lastAssessedAt ?? next.lastAssessedAt,
      modalities: mergeUniqueStrings(next.modalities, c.recovery.modalities),
      notes: mergeUniqueStrings(next.notes, c.recovery.notes),
      sourceAgentIds: mergeUniqueStrings(
        next.sourceAgentIds,
        c.recovery.sourceAgentIds,
        [c.agentId],
      ),
    });
  }
  return next;
}

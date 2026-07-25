import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { RecoveryComparison } from "../models/RecoveryComparison";
import { freezeComparison } from "../utils/FreezeRecoveryAdaptation";
import { diffKeys } from "./diffHelpers";

export function compareRecoveryPlans(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly beforeKeys: readonly string[];
  readonly afterKeys: readonly string[];
  readonly at: string;
}): RecoveryComparison {
  const diff = diffKeys(input.beforeKeys, input.afterKeys);
  return freezeComparison({
    id: `comparison:plan:${input.id}`,
    athleteId: input.athleteId,
    planId: input.planId,
    beforeKeys: Object.freeze([...input.beforeKeys]),
    afterKeys: Object.freeze([...input.afterKeys]),
    addedKeys: diff.added,
    removedKeys: diff.removed,
    sharedKeys: diff.shared,
    metadata: EMPTY_RECOVERY_METADATA,
    createdAt: input.at,
  });
}

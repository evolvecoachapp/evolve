import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { RecoverySummary } from "../models/RecoverySummary";
import { freezeSummary } from "../utils/FreezeRecoveryAdaptation";

export function buildRecoverySummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptation: RecoveryAdaptation | null;
  readonly at: string;
}): RecoverySummary {
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    planId: input.planId,
    contextId: input.contextId,
    adaptationId: input.adaptation?.id ?? null,
    modificationCount: input.adaptation?.modifications.length ?? 0,
    adjustmentCount: input.adaptation?.adjustments.length ?? 0,
    decisionKeys: Object.freeze([...(input.adaptation?.decisionKeys ?? [])]),
    metadata: EMPTY_RECOVERY_METADATA,
    createdAt: input.at,
  });
}

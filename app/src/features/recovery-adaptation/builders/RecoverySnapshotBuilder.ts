import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { RecoverySnapshot } from "../models/RecoverySnapshot";
import type { UpdatedRecoveryPlan } from "../models/UpdatedRecoveryPlan";
import { freezeSnapshot } from "../utils/FreezeRecoveryAdaptation";

export function buildRecoverySnapshot(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptation: RecoveryAdaptation | null;
  readonly updatedPlan: UpdatedRecoveryPlan | null;
  readonly planKeys: readonly string[];
  readonly at: string;
}): RecoverySnapshot {
  const plan = input.updatedPlan;
  return freezeSnapshot({
    id: input.id,
    athleteId: input.athleteId,
    planId: input.planId,
    contextId: input.contextId,
    adaptationId: input.adaptation?.id ?? null,
    planKeys: Object.freeze([...(plan ? [plan.id, ...input.planKeys] : input.planKeys)]),
    dayKeys: Object.freeze([...(plan?.dayKeys ?? [])]),
    sleepKeys: Object.freeze([...(plan?.sleepKeys ?? [])]),
    protocolKeys: Object.freeze([...(plan?.protocolKeys ?? [])]),
    mobilityKeys: Object.freeze([...(plan?.mobilityKeys ?? [])]),
    weekKeys: Object.freeze([...(plan?.weekKeys ?? [])]),
    modificationIds: Object.freeze([
      ...(plan?.modificationIds ?? input.adaptation?.modifications.map((m) => m.id) ?? []),
    ]),
    metadata: EMPTY_RECOVERY_METADATA,
    createdAt: input.at,
  });
}

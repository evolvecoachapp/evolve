import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { DeloadAdjustment } from "../models/DeloadAdjustment";
import { freezeDeloadAdjustment } from "../utils/FreezeRecoveryAdaptation";

/** Deterministic key → modification mapping. NO recovery generation. */
export function adaptCardio(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly DeloadAdjustment[] {
  const out: DeloadAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("deload")) continue;
    out.push(
      freezeDeloadAdjustment({
        id: `adj:deload:${input.id}:${key}`,
        deloadKey: `deload:${key}`,
        targetKey: `target:deload:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_RECOVERY_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

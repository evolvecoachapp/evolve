import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { StressAdjustment } from "../models/StressAdjustment";
import { freezeStressAdjustment } from "../utils/FreezeRecoveryAdaptation";

/** Deterministic key → modification mapping. NO recovery generation. */
export function adaptStress(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly StressAdjustment[] {
  const out: StressAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("stress")) continue;
    out.push(
      freezeStressAdjustment({
        id: `adj:stress:${input.id}:${key}`,
        stressKey: `stress:${key}`,
        targetKey: `target:stress:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_RECOVERY_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

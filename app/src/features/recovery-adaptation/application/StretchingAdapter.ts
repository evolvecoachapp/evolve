import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { StretchingAdjustment } from "../models/StretchingAdjustment";
import { freezeStretchingAdjustment } from "../utils/FreezeRecoveryAdaptation";

/** Deterministic key → modification mapping. NO recovery generation. */
export function adaptStretching(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly StretchingAdjustment[] {
  const out: StretchingAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("stretching")) continue;
    out.push(
      freezeStretchingAdjustment({
        id: `adj:stretching:${input.id}:${key}`,
        stretchingKey: `stretching:${key}`,
        targetKey: `target:stretching:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_RECOVERY_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

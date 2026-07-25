import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { RecoveryProtocolAdjustment } from "../models/RecoveryProtocolAdjustment";
import { freezeRecoveryProtocolAdjustment } from "../utils/FreezeRecoveryAdaptation";

/** Deterministic key → modification mapping. NO recovery generation. */
export function adaptDeload(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly RecoveryProtocolAdjustment[] {
  const out: RecoveryProtocolAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("diet-break") && !key.includes("dietbreak")) continue;
    out.push(
      freezeRecoveryProtocolAdjustment({
        id: `adj:diet-break:${input.id}:${key}`,
        protocolKey: `diet-break:${key}`,
        targetKey: `target:diet-break:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_RECOVERY_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

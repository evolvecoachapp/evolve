import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { MobilityAdjustment } from "../models/MobilityAdjustment";
import { freezeMobilityAdjustment } from "../utils/FreezeRecoveryAdaptation";

/** Deterministic key → modification mapping. NO recovery generation. */
export function adaptMobility(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly MobilityAdjustment[] {
  const out: MobilityAdjustment[] = [];
  for (const target of input.targetKeys) {
    if (!target.includes("timing")) continue;
    out.push(
      freezeMobilityAdjustment({
        id: `adj:timing:${input.id}:${target}`,
        mobilityKey: target.replace(/^target:/, ""),
        targetKey: target,
        sourceDecisionKeys: Object.freeze([...input.decisionKeys]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_RECOVERY_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

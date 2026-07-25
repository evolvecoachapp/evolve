import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { RecoveryDayAdjustment } from "../models/RecoveryDayAdjustment";
import { freezeRecoveryDayAdjustment } from "../utils/FreezeRecoveryAdaptation";

/** Deterministic key → modification mapping. NO recovery generation. */
export function adaptRecoveryDay(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly RecoveryDayAdjustment[] {
  const out: RecoveryDayAdjustment[] = [];
  for (const target of input.targetKeys) {
    if (!target.includes("day")) continue;
    out.push(
      freezeRecoveryDayAdjustment({
        id: `adj:day:${input.id}:${target}`,
        dayKey: target.replace(/^target:/, ""),
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

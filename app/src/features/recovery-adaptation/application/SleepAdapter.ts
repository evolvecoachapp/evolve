import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { SleepAdjustment } from "../models/SleepAdjustment";
import { freezeSleepAdjustment } from "../utils/FreezeRecoveryAdaptation";

/** Deterministic key → modification mapping. NO recovery generation. */
export function adaptSleep(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly SleepAdjustment[] {
  const out: SleepAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("sleep")) continue;
    out.push(
      freezeSleepAdjustment({
        id: `adj:sleep:${input.id}:${key}`,
        sleepKey: `sleep:${key}`,
        targetKey: `target:sleep:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_RECOVERY_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

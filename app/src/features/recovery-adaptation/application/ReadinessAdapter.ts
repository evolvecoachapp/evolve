import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { ReadinessAdjustment } from "../models/ReadinessAdjustment";
import { freezeReadinessAdjustment } from "../utils/FreezeRecoveryAdaptation";

/** Deterministic key → modification mapping. NO recovery generation. */
export function adaptReadiness(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly ReadinessAdjustment[] {
  const out: ReadinessAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (
      !key.includes("protocol") &&
      !key.includes("fatigue") &&
      !key.includes("readiness") &&
      !key.includes("fat") &&
      !key.includes("cardio")
    ) {
      continue;
    }
    out.push(
      freezeReadinessAdjustment({
        id: `adj:protocol:${input.id}:${key}`,
        readinessKey: `protocol:${key}`,
        targetKey: `target:protocol:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_RECOVERY_METADATA,
        createdAt: input.at,
      }),
    );
  }
  for (const target of input.targetKeys) {
    if (!target.includes("protocol")) continue;
    out.push(
      freezeReadinessAdjustment({
        id: `adj:protocol:${input.id}:${target}`,
        readinessKey: target.replace(/^target:/, ""),
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

import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { LoadAdjustment } from "../models/LoadAdjustment";
import { freezeLoadAdjustment } from "../utils/FreezeWorkoutAdaptation";

/** Deterministic key → modification mapping. NO workout generation. */
export function adaptLoad(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly LoadAdjustment[] {
  const out: LoadAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("load") && !key.includes("intensity") && !key.includes("progression")) continue;
    out.push(
      freezeLoadAdjustment({
        id: `adj:load:${input.id}:${key}`,
        loadKey: `load:${key}`,
        targetKey: `target:load:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

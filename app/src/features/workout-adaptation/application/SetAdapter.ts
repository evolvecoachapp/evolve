import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { SetAdjustment } from "../models/SetAdjustment";
import { freezeSetAdjustment } from "../utils/FreezeWorkoutAdaptation";

/** Deterministic key → modification mapping. NO workout generation. */
export function adaptSet(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly SetAdjustment[] {
  const out: SetAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("volume") && !key.includes("set")) continue;
    out.push(
      freezeSetAdjustment({
        id: `adj:set:${input.id}:${key}`,
        setKey: `set:${key}`,
        targetKey: `target:set:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

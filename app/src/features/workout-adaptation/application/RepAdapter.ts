import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { RepAdjustment } from "../models/RepAdjustment";
import { freezeRepAdjustment } from "../utils/FreezeWorkoutAdaptation";

/** Deterministic key → modification mapping. NO workout generation. */
export function adaptRep(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly RepAdjustment[] {
  const out: RepAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("rep") && !key.includes("volume")) continue;
    out.push(
      freezeRepAdjustment({
        id: `adj:rep:${input.id}:${key}`,
        repKey: `rep:${key}`,
        targetKey: `target:rep:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

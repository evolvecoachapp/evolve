import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { RestAdjustment } from "../models/RestAdjustment";
import { freezeRestAdjustment } from "../utils/FreezeWorkoutAdaptation";

/** Deterministic key → modification mapping. NO workout generation. */
export function adaptRest(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly RestAdjustment[] {
  const out: RestAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("rest") && !key.includes("recovery")) continue;
    out.push(
      freezeRestAdjustment({
        id: `adj:rest:${input.id}:${key}`,
        restKey: `rest:${key}`,
        targetKey: `target:rest:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { FrequencyAdjustment } from "../models/FrequencyAdjustment";
import { freezeFrequencyAdjustment } from "../utils/FreezeWorkoutAdaptation";

/** Deterministic key → modification mapping. NO workout generation. */
export function adaptFrequency(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly FrequencyAdjustment[] {
  const out: FrequencyAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("frequency")) continue;
    out.push(
      freezeFrequencyAdjustment({
        id: `adj:frequency:${input.id}:${key}`,
        frequencyKey: `frequency:${key}`,
        targetKey: `target:frequency:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

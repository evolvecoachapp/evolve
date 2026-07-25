import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { TempoAdjustment } from "../models/TempoAdjustment";
import { freezeTempoAdjustment } from "../utils/FreezeWorkoutAdaptation";

/** Deterministic key → modification mapping. NO workout generation. */
export function adaptTempo(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly TempoAdjustment[] {
  const out: TempoAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("tempo")) continue;
    out.push(
      freezeTempoAdjustment({
        id: `adj:tempo:${input.id}:${key}`,
        tempoKey: `tempo:${key}`,
        targetKey: `target:tempo:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

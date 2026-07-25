import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { VolumeAdjustment } from "../models/VolumeAdjustment";
import { freezeVolumeAdjustment } from "../utils/FreezeWorkoutAdaptation";

/** Deterministic key → modification mapping. NO workout generation. */
export function adaptVolume(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly VolumeAdjustment[] {
  const out: VolumeAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (!key.includes("volume")) continue;
    out.push(
      freezeVolumeAdjustment({
        id: `adj:volume:${input.id}:${key}`,
        volumeKey: `volume:${key}`,
        targetKey: `target:volume:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

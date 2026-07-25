import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { ExerciseAdjustment } from "../models/ExerciseAdjustment";
import { freezeExerciseAdjustment } from "../utils/FreezeWorkoutAdaptation";

/** Deterministic key → modification mapping. NO workout generation. */
export function adaptExercise(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly ExerciseAdjustment[] {
  const out: ExerciseAdjustment[] = [];
  for (const target of input.targetKeys) {
    if (!target.includes("exercise")) continue;
    out.push(
      freezeExerciseAdjustment({
        id: `adj:exercise:${input.id}:${target}`,
        exerciseKey: target.replace(/^target:/, ""),
        targetKey: target,
        sourceDecisionKeys: Object.freeze([...input.decisionKeys]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_WORKOUT_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

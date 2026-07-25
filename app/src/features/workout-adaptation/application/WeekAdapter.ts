import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { WeeklyAdjustment } from "../models/WeeklyAdjustment";
import { freezeWeeklyAdjustment } from "../utils/FreezeWorkoutAdaptation";

/** Deterministic key → modification mapping. NO workout generation. */
export function adaptWeek(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly WeeklyAdjustment[] {
  const out: WeeklyAdjustment[] = [];
  for (const target of input.targetKeys) {
    if (!target.includes("week")) continue;
    out.push(
      freezeWeeklyAdjustment({
        id: `adj:week:${input.id}:${target}`,
        weekKey: target.replace(/^target:/, ""),
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

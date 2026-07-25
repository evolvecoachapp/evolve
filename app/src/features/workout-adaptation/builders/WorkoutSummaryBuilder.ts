import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import { freezeSummary } from "../utils/FreezeWorkoutAdaptation";

export function buildWorkoutSummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly adaptation: WorkoutAdaptation | null;
  readonly at: string;
}): WorkoutSummary {
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    blueprintId: input.blueprintId,
    contextId: input.contextId,
    adaptationId: input.adaptation?.id ?? null,
    modificationCount: input.adaptation?.modifications.length ?? 0,
    adjustmentCount: input.adaptation?.adjustments.length ?? 0,
    decisionKeys: Object.freeze([...(input.adaptation?.decisionKeys ?? [])]),
    metadata: EMPTY_WORKOUT_METADATA,
    createdAt: input.at,
  });
}

import type { UpdatedWorkoutBlueprint } from "../models/UpdatedWorkoutBlueprint";
import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { WorkoutSnapshot } from "../models/WorkoutSnapshot";
import { freezeSnapshot } from "../utils/FreezeWorkoutAdaptation";

export function buildWorkoutSnapshot(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly adaptation: WorkoutAdaptation | null;
  readonly updatedBlueprint: UpdatedWorkoutBlueprint | null;
  readonly blueprintKeys: readonly string[];
  readonly at: string;
}): WorkoutSnapshot {
  const bp = input.updatedBlueprint;
  return freezeSnapshot({
    id: input.id,
    athleteId: input.athleteId,
    blueprintId: input.blueprintId,
    contextId: input.contextId,
    adaptationId: input.adaptation?.id ?? null,
    blueprintKeys: Object.freeze([...(bp ? [bp.id, ...input.blueprintKeys] : input.blueprintKeys)]),
    dayKeys: Object.freeze([...(bp?.dayKeys ?? [])]),
    exerciseKeys: Object.freeze([...(bp?.exerciseKeys ?? [])]),
    sessionKeys: Object.freeze([...(bp?.sessionKeys ?? [])]),
    weekKeys: Object.freeze([...(bp?.weekKeys ?? [])]),
    modificationIds: Object.freeze([
      ...(bp?.modificationIds ?? input.adaptation?.modifications.map((m) => m.id) ?? []),
    ]),
    metadata: EMPTY_WORKOUT_METADATA,
    createdAt: input.at,
  });
}

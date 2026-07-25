import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import type { WorkoutComparison } from "../models/WorkoutComparison";
import { freezeComparison } from "../utils/FreezeWorkoutAdaptation";
import { diffKeys } from "./diffHelpers";

export function compareBlueprints(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly beforeKeys: readonly string[];
  readonly afterKeys: readonly string[];
  readonly at: string;
}): WorkoutComparison {
  const diff = diffKeys(input.beforeKeys, input.afterKeys);
  return freezeComparison({
    id: `comparison:blueprint:${input.id}`,
    athleteId: input.athleteId,
    blueprintId: input.blueprintId,
    beforeKeys: Object.freeze([...input.beforeKeys]),
    afterKeys: Object.freeze([...input.afterKeys]),
    addedKeys: diff.added,
    removedKeys: diff.removed,
    sharedKeys: diff.shared,
    metadata: EMPTY_WORKOUT_METADATA,
    createdAt: input.at,
  });
}

import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
import type { WorkoutBlock, WorkoutBlockKind } from "../models/WorkoutBlock";
import type { WorkoutExercise } from "../models/WorkoutExercise";

const ROLE_ORDER: readonly CandidateRole[] = Object.freeze([
  "primary",
  "secondary",
  "accessory",
]);

/**
 * Group assembled exercises into ordered WorkoutBlocks by role.
 */
export function groupIntoBlocks(
  exercises: readonly WorkoutExercise[],
  options: { readonly isRecoveryDay?: boolean } = {},
): readonly WorkoutBlock[] {
  const blocks: WorkoutBlock[] = [];
  let order = 1;

  if (options.isRecoveryDay) {
    const recoveryExercises = exercises;
    blocks.push(
      Object.freeze({
        id: "block:recovery",
        kind: "recovery" as const,
        role: "recovery" as const,
        order: order++,
        label: "Recovery",
        exerciseIds: Object.freeze(
          recoveryExercises.map((exercise) => exercise.id),
        ),
        estimatedDurationSeconds: recoveryExercises.reduce(
          (sum, exercise) => sum + exercise.estimatedDurationSeconds,
          0,
        ),
      }),
    );
    return Object.freeze(blocks);
  }

  for (const role of ROLE_ORDER) {
    const roleExercises = exercises.filter((exercise) => exercise.role === role);
    if (roleExercises.length === 0) {
      continue;
    }
    const kind = role as WorkoutBlockKind;
    blocks.push(
      Object.freeze({
        id: `block:${kind}`,
        kind,
        role,
        order: order++,
        label: capitalize(role),
        exerciseIds: Object.freeze(
          roleExercises.map((exercise) => exercise.id),
        ),
        estimatedDurationSeconds: roleExercises.reduce(
          (sum, exercise) => sum + exercise.estimatedDurationSeconds,
          0,
        ),
      }),
    );
  }

  return Object.freeze(blocks);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

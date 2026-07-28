import {
  createWorkoutExercise,
} from "../models/experience/WorkoutExercise";
import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";
import { createWorkoutSet } from "../models/experience/WorkoutSet";
import { rebuildWorkoutRuntime } from "../mappers";

export interface UpdateWorkoutSetInput {
  readonly setId?: string;
  readonly weight?: number | null;
  readonly repetitions?: number | null;
  readonly rpe?: number | null;
  readonly notes?: string;
}

/** Updates editable values on the current (or specified) set. */
export function updateWorkoutSet(
  runtime: WorkoutRuntime,
  input: UpdateWorkoutSetInput,
): WorkoutRuntime {
  const targetSetId =
    input.setId ??
    runtime.exercises[runtime.currentExerciseIndex]?.sets[
      runtime.currentSetIndex
    ]?.id;

  if (!targetSetId) {
    return runtime;
  }

  const exercises = runtime.exercises.map((exercise) => {
    const hasTarget = exercise.sets.some((set) => set.id === targetSetId);
    if (!hasTarget) {
      return exercise;
    }

    const sets = exercise.sets.map((set) => {
      if (set.id !== targetSetId) {
        return set;
      }
      return createWorkoutSet({
        ...set,
        weight: input.weight !== undefined ? input.weight : set.weight,
        repetitions:
          input.repetitions !== undefined ? input.repetitions : set.repetitions,
        rpe: input.rpe !== undefined ? input.rpe : set.rpe,
        notes: input.notes !== undefined ? input.notes : set.notes,
      });
    });

    return createWorkoutExercise({
      ...exercise,
      sets: Object.freeze(sets),
    });
  });

  return rebuildWorkoutRuntime(runtime, {
    exercises: Object.freeze(exercises),
  });
}

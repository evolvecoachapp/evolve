import {
  createWorkoutExercise,
  WorkoutExerciseStatuses,
} from "../models/experience/WorkoutExercise";
import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";
import {
  createWorkoutSet,
  WorkoutSetStatuses,
} from "../models/experience/WorkoutSet";
import { createIdleWorkoutTimer } from "../models/experience/WorkoutTimer";
import { rebuildWorkoutRuntime } from "../mappers";
import { WorkoutRuntimeStatuses } from "../models/experience/WorkoutRuntimeState";

export type NavigateWorkoutDirection =
  | "next"
  | "previous"
  | "skip"
  | number;

function relabel(
  runtime: WorkoutRuntime,
  exerciseIndex: number,
  setIndex: number,
): readonly import("../models/experience/WorkoutExercise").WorkoutExercise[] {
  return runtime.exercises.map((exercise, eIndex) => {
    if (exercise.status === WorkoutExerciseStatuses.SKIPPED) {
      return exercise;
    }

    const sets = exercise.sets.map((set, sIndex) => {
      if (set.completed || set.status === WorkoutSetStatuses.SKIPPED) {
        return set;
      }
      const isCurrent = eIndex === exerciseIndex && sIndex === setIndex;
      return createWorkoutSet({
        ...set,
        status: isCurrent
          ? WorkoutSetStatuses.CURRENT
          : WorkoutSetStatuses.PENDING,
      });
    });

    const completedSetCount = sets.filter((set) => set.completed).length;
    const allDone =
      sets.length > 0 &&
      sets.every(
        (set) =>
          set.completed || set.status === WorkoutSetStatuses.SKIPPED,
      );

    let status: import("../models/experience/WorkoutExercise").WorkoutExerciseStatus =
      WorkoutExerciseStatuses.PENDING;
    if (allDone) {
      status = WorkoutExerciseStatuses.COMPLETED;
    } else if (eIndex === exerciseIndex) {
      status = WorkoutExerciseStatuses.CURRENT;
    }

    return createWorkoutExercise({
      ...exercise,
      sets: Object.freeze(sets),
      currentSetIndex: eIndex === exerciseIndex ? setIndex : 0,
      status,
      completedSetCount,
      progressPercent:
        sets.length === 0
          ? 0
          : Math.round((completedSetCount / sets.length) * 100),
    });
  });
}

/** Navigates exercises / skips the current exercise. */
export function navigateWorkout(
  runtime: WorkoutRuntime,
  direction: NavigateWorkoutDirection,
): WorkoutRuntime {
  if (runtime.state.isCompleted || runtime.isEmpty) {
    return runtime;
  }

  if (typeof direction === "number") {
    const targetIndex = Math.max(
      0,
      Math.min(direction, runtime.exercises.length - 1),
    );
    const labeled = relabel(runtime, targetIndex, 0);
    return rebuildWorkoutRuntime(runtime, {
      exercises: Object.freeze(labeled),
      currentExerciseIndex: targetIndex,
      currentSetIndex: 0,
      timer: createIdleWorkoutTimer(),
      status: WorkoutRuntimeStatuses.ACTIVE,
    });
  }

  if (direction === "skip") {
    const exerciseIndex = runtime.currentExerciseIndex;
    const exercises = runtime.exercises.map((exercise, eIndex) => {
      if (eIndex !== exerciseIndex) {
        return exercise;
      }
      const sets = exercise.sets.map((set) => {
        if (set.completed) {
          return set;
        }
        return createWorkoutSet({
          ...set,
          status: WorkoutSetStatuses.SKIPPED,
          completed: false,
        });
      });
      return createWorkoutExercise({
        ...exercise,
        sets: Object.freeze(sets),
        status: WorkoutExerciseStatuses.SKIPPED,
        completedSetCount: sets.filter((set) => set.completed).length,
        progressPercent: 100,
      });
    });

    const nextExerciseIndex =
      exerciseIndex + 1 < runtime.exercises.length
        ? exerciseIndex + 1
        : exerciseIndex;
    const done = nextExerciseIndex === exerciseIndex;
    const labeled = relabel(
      rebuildWorkoutRuntime(runtime, {
        exercises: Object.freeze(exercises),
        currentExerciseIndex: nextExerciseIndex,
        currentSetIndex: 0,
      }),
      nextExerciseIndex,
      0,
    );

    return rebuildWorkoutRuntime(runtime, {
      exercises: Object.freeze(labeled),
      currentExerciseIndex: nextExerciseIndex,
      currentSetIndex: 0,
      timer: createIdleWorkoutTimer(),
      finishedAt: done ? new Date().toISOString() : runtime.finishedAt,
      status: done
        ? WorkoutRuntimeStatuses.COMPLETED
        : WorkoutRuntimeStatuses.ACTIVE,
    });
  }

  if (direction === "next") {
    const nextIndex = Math.min(
      runtime.currentExerciseIndex + 1,
      runtime.exercises.length - 1,
    );
    const labeled = relabel(runtime, nextIndex, 0);
    return rebuildWorkoutRuntime(runtime, {
      exercises: Object.freeze(labeled),
      currentExerciseIndex: nextIndex,
      currentSetIndex: 0,
      timer: createIdleWorkoutTimer(),
      status: WorkoutRuntimeStatuses.ACTIVE,
    });
  }

  const previousIndex = Math.max(runtime.currentExerciseIndex - 1, 0);
  const labeled = relabel(runtime, previousIndex, 0);
  return rebuildWorkoutRuntime(runtime, {
    exercises: Object.freeze(labeled),
    currentExerciseIndex: previousIndex,
    currentSetIndex: 0,
    timer: createIdleWorkoutTimer(),
    status: WorkoutRuntimeStatuses.ACTIVE,
  });
}

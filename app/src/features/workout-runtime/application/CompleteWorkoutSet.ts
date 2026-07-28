import {
  createWorkoutExercise,
  WorkoutExerciseStatuses,
} from "../models/experience/WorkoutExercise";
import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";
import {
  createWorkoutSet,
  WorkoutSetStatuses,
} from "../models/experience/WorkoutSet";
import {
  createIdleWorkoutTimer,
  createWorkoutTimer,
  WorkoutTimerStatuses,
} from "../models/experience/WorkoutTimer";
import { rebuildWorkoutRuntime } from "../mappers";
import { WorkoutRuntimeStatuses } from "../models/experience/WorkoutRuntimeState";

function findCurrentSet(runtime: WorkoutRuntime) {
  const exercise = runtime.exercises[runtime.currentExerciseIndex];
  if (!exercise) {
    return null;
  }
  const set = exercise.sets[runtime.currentSetIndex];
  if (!set) {
    return null;
  }
  return { exercise, set };
}

function advanceCursor(
  runtime: WorkoutRuntime,
  exerciseIndex: number,
  setIndex: number,
): { exerciseIndex: number; setIndex: number; done: boolean } {
  const exercise = runtime.exercises[exerciseIndex];
  if (!exercise) {
    return { exerciseIndex, setIndex, done: true };
  }

  if (setIndex + 1 < exercise.sets.length) {
    return { exerciseIndex, setIndex: setIndex + 1, done: false };
  }

  if (exerciseIndex + 1 < runtime.exercises.length) {
    return { exerciseIndex: exerciseIndex + 1, setIndex: 0, done: false };
  }

  return { exerciseIndex, setIndex, done: true };
}

function relabelSets(
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
      currentSetIndex: eIndex === exerciseIndex ? setIndex : exercise.currentSetIndex,
      status,
      completedSetCount,
      progressPercent:
        sets.length === 0
          ? 0
          : Math.round((completedSetCount / sets.length) * 100),
    });
  });
}

export interface CompleteWorkoutSetInput {
  readonly weight?: number | null;
  readonly repetitions?: number | null;
  readonly rpe?: number | null;
  readonly notes?: string;
  readonly now?: Date;
}

/** Completes the current set and advances cursor / rest timer. */
export function completeWorkoutSet(
  runtime: WorkoutRuntime,
  input: CompleteWorkoutSetInput = {},
): WorkoutRuntime {
  const current = findCurrentSet(runtime);
  if (!current || runtime.state.isCompleted) {
    return runtime;
  }

  const now = input.now ?? new Date();
  const startedAt = runtime.startedAt ?? now.toISOString();

  const exercises = runtime.exercises.map((exercise, eIndex) => {
    if (eIndex !== runtime.currentExerciseIndex) {
      return exercise;
    }

    const sets = exercise.sets.map((set, sIndex) => {
      if (sIndex !== runtime.currentSetIndex) {
        return set;
      }
      return createWorkoutSet({
        ...set,
        weight: input.weight ?? set.weight,
        repetitions: input.repetitions ?? set.repetitions ?? set.targetReps,
        rpe: input.rpe ?? set.rpe,
        notes: input.notes ?? set.notes,
        status: WorkoutSetStatuses.COMPLETED,
        completed: true,
      });
    });

    const completedSetCount = sets.filter((set) => set.completed).length;
    const allDone = sets.every(
      (set) => set.completed || set.status === WorkoutSetStatuses.SKIPPED,
    );

    return createWorkoutExercise({
      ...exercise,
      sets: Object.freeze(sets),
      completedSetCount,
      status: allDone
        ? WorkoutExerciseStatuses.COMPLETED
        : WorkoutExerciseStatuses.CURRENT,
      progressPercent:
        sets.length === 0
          ? 0
          : Math.round((completedSetCount / sets.length) * 100),
    });
  });

  const next = advanceCursor(
    runtime,
    runtime.currentExerciseIndex,
    runtime.currentSetIndex,
  );

  const labeled = relabelSets(
    rebuildWorkoutRuntime(runtime, {
      exercises: Object.freeze(exercises),
      currentExerciseIndex: next.exerciseIndex,
      currentSetIndex: next.setIndex,
      startedAt,
    }),
    next.exerciseIndex,
    next.setIndex,
  );

  const restSeconds = current.set.restSeconds;
  const timer = next.done
    ? createIdleWorkoutTimer()
    : createWorkoutTimer({
        status: WorkoutTimerStatuses.RUNNING,
        targetSeconds: restSeconds,
        remainingSeconds: restSeconds,
        elapsedSeconds: 0,
        isOvertime: false,
        label: "Rest",
      });

  return rebuildWorkoutRuntime(runtime, {
    exercises: Object.freeze(labeled),
    currentExerciseIndex: next.exerciseIndex,
    currentSetIndex: next.setIndex,
    timer,
    startedAt,
    finishedAt: next.done ? now.toISOString() : runtime.finishedAt,
    status: next.done
      ? WorkoutRuntimeStatuses.COMPLETED
      : WorkoutRuntimeStatuses.RESTING,
  });
}

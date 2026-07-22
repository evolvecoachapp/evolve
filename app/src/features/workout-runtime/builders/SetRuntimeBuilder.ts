import type { WorkoutSet } from "../../workout-assembly/models/WorkoutExercise";
import type { SetRuntime } from "../models/SetRuntime";
import type { SetState } from "../models/SetState";

export interface BuildSetRuntimeInput {
  readonly exerciseRuntimeId: string;
  readonly workoutExerciseId: string;
  readonly set: WorkoutSet;
  readonly state?: SetState;
}

/**
 * Build a SetRuntime from an immutable WorkoutSet prescription.
 */
export class SetRuntimeBuilder {
  build(input: BuildSetRuntimeInput): SetRuntime {
    const state = input.state ?? "Pending";
    return Object.freeze({
      id: `set:${input.workoutExerciseId}:${input.set.setIndex}`,
      exerciseRuntimeId: input.exerciseRuntimeId,
      setIndex: input.set.setIndex,
      prescribedRepMin: input.set.repMin,
      prescribedRepMax: input.set.repMax,
      prescribedTargetRpe: input.set.targetRpe,
      prescribedTargetRir: input.set.targetRir,
      state,
      weight: null,
      repetitions: null,
      rpe: null,
      rir: null,
      notes: Object.freeze([] as string[]),
      completed: false,
    });
  }

  withState(set: SetRuntime, state: SetState): SetRuntime {
    return Object.freeze({
      ...set,
      state,
      completed: state === "Completed",
    });
  }

  withPerformance(
    set: SetRuntime,
    performance: {
      readonly weight?: number | null;
      readonly repetitions?: number | null;
      readonly rpe?: number | null;
      readonly rir?: number | null;
      readonly notes?: readonly string[];
    },
  ): SetRuntime {
    return Object.freeze({
      ...set,
      state: "Completed" as const,
      weight: performance.weight ?? set.weight,
      repetitions: performance.repetitions ?? set.repetitions,
      rpe: performance.rpe ?? set.rpe,
      rir: performance.rir ?? set.rir,
      notes: Object.freeze([...(performance.notes ?? set.notes)]),
      completed: true,
    });
  }
}

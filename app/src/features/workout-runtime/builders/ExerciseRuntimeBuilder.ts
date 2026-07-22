import type { WorkoutExercise } from "../../workout-assembly/models/WorkoutExercise";
import type { ExerciseRuntime } from "../models/ExerciseRuntime";
import type { ExerciseState } from "../models/ExerciseState";
import type { SetRuntime } from "../models/SetRuntime";
import { SetRuntimeBuilder } from "./SetRuntimeBuilder";

export interface BuildExerciseRuntimeInput {
  readonly workoutExercise: WorkoutExercise;
  readonly state?: ExerciseState;
  readonly activateFirstSet?: boolean;
}

/**
 * Build an ExerciseRuntime from an immutable WorkoutExercise.
 */
export class ExerciseRuntimeBuilder {
  constructor(private readonly setBuilder: SetRuntimeBuilder = new SetRuntimeBuilder()) {}

  build(input: BuildExerciseRuntimeInput): ExerciseRuntime {
    const id = `exercise-runtime:${input.workoutExercise.id}`;
    const activate = input.activateFirstSet === true;
    const state = input.state ?? (activate ? "Active" : "Pending");

    const sets = input.workoutExercise.sets.map((set, index) =>
      this.setBuilder.build({
        exerciseRuntimeId: id,
        workoutExerciseId: input.workoutExercise.id,
        set,
        state: activate && index === 0 ? "Active" : "Pending",
      }),
    );

    return this.fromParts({
      id,
      workoutExerciseId: input.workoutExercise.id,
      exerciseId: input.workoutExercise.exerciseId,
      name: input.workoutExercise.name,
      order: input.workoutExercise.order,
      state,
      sets,
      currentSetIndex:
        activate && sets.length > 0 ? (sets[0]?.setIndex ?? null) : null,
    });
  }

  fromParts(input: {
    readonly id: string;
    readonly workoutExerciseId: string;
    readonly exerciseId: string;
    readonly name: string;
    readonly order: number;
    readonly state: ExerciseState;
    readonly sets: readonly SetRuntime[];
    readonly currentSetIndex: number | null;
  }): ExerciseRuntime {
    const completedSetCount = input.sets.filter((set) => set.completed).length;
    const skippedSetCount = input.sets.filter(
      (set) => set.state === "Skipped",
    ).length;
    const totalSetCount = input.sets.length;
    const finished = completedSetCount + skippedSetCount;
    const progressPercent =
      totalSetCount === 0
        ? 100
        : Math.min(100, Math.round((finished / totalSetCount) * 100));

    return Object.freeze({
      id: input.id,
      workoutExerciseId: input.workoutExerciseId,
      exerciseId: input.exerciseId,
      name: input.name,
      order: input.order,
      state: input.state,
      sets: Object.freeze([...input.sets]),
      currentSetIndex: input.currentSetIndex,
      completedSetCount,
      skippedSetCount,
      totalSetCount,
      progressPercent,
      skipped: input.state === "Skipped",
      completed: input.state === "Completed",
    });
  }
}

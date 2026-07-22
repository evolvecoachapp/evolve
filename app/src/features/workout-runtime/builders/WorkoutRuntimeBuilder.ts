import type { RestRuntime } from "../../rest-runtime/models/RestRuntime";
import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";
import type { ExerciseRuntime } from "../models/ExerciseRuntime";
import type { WorkoutRuntime } from "../models/WorkoutRuntime";
import type { WorkoutRuntimeConfiguration } from "../models/WorkoutRuntimeConfiguration";
import {
  DEFAULT_WORKOUT_RUNTIME_CONFIGURATION,
} from "../models/WorkoutRuntimeConfiguration";
import type { WorkoutRuntimeEvent } from "../models/WorkoutRuntimeEvent";
import type { WorkoutState } from "../models/WorkoutState";
import { calculateProgress } from "../utils/calculateProgress";
import { buildMetrics } from "../utils/buildSummary";
import { ExerciseRuntimeBuilder } from "./ExerciseRuntimeBuilder";

export interface BuildWorkoutRuntimeInput {
  readonly session: WorkoutSession;
  readonly runtimeId?: string;
  readonly configuration?: Partial<WorkoutRuntimeConfiguration>;
  readonly state?: WorkoutState;
  readonly activateFirstExercise?: boolean;
}

/**
 * Build a WorkoutRuntime from an immutable WorkoutSession.
 */
export class WorkoutRuntimeBuilder {
  constructor(
    private readonly exerciseBuilder: ExerciseRuntimeBuilder = new ExerciseRuntimeBuilder(),
  ) {}

  build(input: BuildWorkoutRuntimeInput): WorkoutRuntime {
    const activate = input.activateFirstExercise !== false;
    const configuration = Object.freeze({
      ...DEFAULT_WORKOUT_RUNTIME_CONFIGURATION,
      ...input.configuration,
    });

    const ordered = [...input.session.exercises].sort(
      (left, right) => left.order - right.order,
    );

    const exercises: ExerciseRuntime[] = ordered.map((exercise, index) =>
      this.exerciseBuilder.build({
        workoutExercise: exercise,
        activateFirstSet: activate && index === 0,
        state: activate && index === 0 ? "Active" : "Pending",
      }),
    );

    const first = exercises[0] ?? null;
    const state = input.state ?? "NotStarted";

    return this.fromParts({
      id: input.runtimeId ?? `runtime:${input.session.id}`,
      session: input.session,
      state,
      exercises,
      currentExerciseIndex: activate && first ? 0 : null,
      currentExerciseId: activate && first ? first.id : null,
      currentSetId:
        activate && first && first.currentSetIndex !== null
          ? (first.sets.find((set) => set.setIndex === first.currentSetIndex)
              ?.id ?? null)
          : null,
      completedExerciseIds: Object.freeze([]),
      skippedExerciseIds: Object.freeze([]),
      configuration,
      events: Object.freeze([]),
      restRuntime: null,
      startedAt: null,
      pausedAt: null,
      completedAt: null,
      cancelledAt: null,
      pauseCount: 0,
    });
  }

  fromParts(input: {
    readonly id: string;
    readonly session: WorkoutSession;
    readonly state: WorkoutState;
    readonly exercises: readonly ExerciseRuntime[];
    readonly currentExerciseIndex: number | null;
    readonly currentExerciseId: string | null;
    readonly currentSetId: string | null;
    readonly completedExerciseIds: readonly string[];
    readonly skippedExerciseIds: readonly string[];
    readonly configuration: WorkoutRuntimeConfiguration;
    readonly events: readonly WorkoutRuntimeEvent[];
    readonly restRuntime?: RestRuntime | null;
    readonly startedAt: string | null;
    readonly pausedAt: string | null;
    readonly completedAt: string | null;
    readonly cancelledAt: string | null;
    readonly pauseCount: number;
  }): WorkoutRuntime {
    const progress = calculateProgress(input.exercises);
    const metrics = buildMetrics({
      exercises: input.exercises,
      eventCount: input.events.length,
      pauseCount: input.pauseCount,
    });

    return Object.freeze({
      id: input.id,
      sessionId: input.session.id,
      session: input.session,
      state: input.state,
      exercises: Object.freeze([...input.exercises]),
      currentExerciseIndex: input.currentExerciseIndex,
      currentExerciseId: input.currentExerciseId,
      currentSetId: input.currentSetId,
      completedExerciseIds: Object.freeze([...input.completedExerciseIds]),
      skippedExerciseIds: Object.freeze([...input.skippedExerciseIds]),
      progress,
      metrics,
      configuration: input.configuration,
      events: Object.freeze([...input.events]),
      restRuntime: input.restRuntime ?? null,
      startedAt: input.startedAt,
      pausedAt: input.pausedAt,
      completedAt: input.completedAt,
      cancelledAt: input.cancelledAt,
    });
  }

  /**
   * Attach (or clear) an owned RestRuntime without altering workout progression.
   */
  withRestRuntime(
    runtime: WorkoutRuntime,
    restRuntime: RestRuntime | null,
  ): WorkoutRuntime {
    return this.fromParts({
      id: runtime.id,
      session: runtime.session,
      state: runtime.state,
      exercises: runtime.exercises,
      currentExerciseIndex: runtime.currentExerciseIndex,
      currentExerciseId: runtime.currentExerciseId,
      currentSetId: runtime.currentSetId,
      completedExerciseIds: runtime.completedExerciseIds,
      skippedExerciseIds: runtime.skippedExerciseIds,
      configuration: runtime.configuration,
      events: runtime.events,
      restRuntime,
      startedAt: runtime.startedAt,
      pausedAt: runtime.pausedAt,
      completedAt: runtime.completedAt,
      cancelledAt: runtime.cancelledAt,
      pauseCount: runtime.metrics.pauseCount,
    });
  }
}

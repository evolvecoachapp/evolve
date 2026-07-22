import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";
import { ExerciseRuntimeBuilder } from "../builders/ExerciseRuntimeBuilder";
import { SetRuntimeBuilder } from "../builders/SetRuntimeBuilder";
import { WorkoutRuntimeBuilder } from "../builders/WorkoutRuntimeBuilder";
import type { CompleteSetInput } from "../models/CompleteSetInput";
import type { ExerciseRuntime } from "../models/ExerciseRuntime";
import type { SetRuntime } from "../models/SetRuntime";
import type { WorkoutResult } from "../models/WorkoutResult";
import type { WorkoutRuntime } from "../models/WorkoutRuntime";
import type { WorkoutRuntimeConfiguration } from "../models/WorkoutRuntimeConfiguration";
import {
  DEFAULT_WORKOUT_RUNTIME_CONFIGURATION,
} from "../models/WorkoutRuntimeConfiguration";
import type {
  WorkoutRuntimeEvent,
  WorkoutRuntimeEventType,
} from "../models/WorkoutRuntimeEvent";
import { WorkoutRuntimeError } from "../models/WorkoutRuntimeError";
import type { WorkoutRuntimeSummary } from "../models/WorkoutRuntimeSummary";
import type { WorkoutState } from "../models/WorkoutState";
import {
  buildSummary,
  freezeResult,
  freezeRuntime,
  freezeSummary,
  validateSessionForRuntime,
} from "../utils";
import {
  canAutoCompleteWorkout,
  canTransitionWorkoutState,
  getCurrentExercise,
  getCurrentSet,
  validateExerciseProgression,
  validateMutationAllowed,
  validateSetProgression,
  validateWorkoutCompletion,
} from "../validators";

const DEFAULT_TIMESTAMP = "2026-07-22T00:00:00.000Z";

/**
 * In-memory workout runtime engine.
 *
 * Consumes an immutable WorkoutSession and maintains mutable runtime state.
 * No timers. No persistence. No networking. No program-generation changes.
 */
export class WorkoutRuntimeEngine {
  private runtime: WorkoutRuntime | null = null;
  private pauseCount = 0;
  private eventSequence = 0;

  constructor(
    private readonly workoutBuilder: WorkoutRuntimeBuilder = new WorkoutRuntimeBuilder(),
    private readonly exerciseBuilder: ExerciseRuntimeBuilder = new ExerciseRuntimeBuilder(),
    private readonly setBuilder: SetRuntimeBuilder = new SetRuntimeBuilder(),
  ) {}

  /**
   * Seed runtime from session and transition NotStarted → Running.
   */
  start(
    session: WorkoutSession,
    configuration: Partial<WorkoutRuntimeConfiguration> = {},
  ): WorkoutRuntimeSummary {
    if (this.runtime !== null && this.runtime.state !== "NotStarted") {
      throw new WorkoutRuntimeError(
        "already_started",
        `Cannot start workout in state ${this.runtime.state}`,
      );
    }

    const sessionIssues = validateSessionForRuntime(session);
    if (sessionIssues.length > 0) {
      throw new WorkoutRuntimeError(
        "invalid_session",
        sessionIssues.join("; "),
      );
    }

    const config = Object.freeze({
      ...DEFAULT_WORKOUT_RUNTIME_CONFIGURATION,
      ...configuration,
    });

    const seeded = this.workoutBuilder.build({
      session,
      configuration: config,
      state: "NotStarted",
      activateFirstExercise: true,
    });

    const timestamp = this.timestamp(config);
    this.pauseCount = 0;
    this.eventSequence = 0;

    this.runtime = this.withState(seeded, "Running", {
      startedAt: timestamp,
      eventType: "workout_started",
      message: "Workout started",
      timestamp,
    });

    return this.summary();
  }

  pause(): WorkoutRuntimeSummary {
    const runtime = this.requireRuntime();
    this.assertTransition(runtime.state, "Paused");
    const timestamp = this.timestamp(runtime.configuration);
    this.pauseCount += 1;
    this.runtime = this.withState(runtime, "Paused", {
      pausedAt: timestamp,
      eventType: "workout_paused",
      message: "Workout paused",
      timestamp,
    });
    return this.summary();
  }

  resume(): WorkoutRuntimeSummary {
    const runtime = this.requireRuntime();
    this.assertTransition(runtime.state, "Running");
    const timestamp = this.timestamp(runtime.configuration);
    this.runtime = this.withState(runtime, "Running", {
      pausedAt: null,
      eventType: "workout_resumed",
      message: "Workout resumed",
      timestamp,
    });
    return this.summary();
  }

  finish(): WorkoutResult {
    return this.complete();
  }

  complete(): WorkoutResult {
    const runtime = this.requireRuntime();
    this.assertTransition(runtime.state, "Completed");

    const issues = validateWorkoutCompletion(runtime);
    const unfinished = issues.filter((issue) =>
      issue.startsWith("unfinished_exercises"),
    );
    if (unfinished.length > 0) {
      throw new WorkoutRuntimeError(
        "incomplete_workout",
        unfinished.join("; "),
      );
    }

    const timestamp = this.timestamp(runtime.configuration);
    this.runtime = this.withState(runtime, "Completed", {
      completedAt: timestamp,
      currentExerciseIndex: null,
      currentExerciseId: null,
      currentSetId: null,
      eventType: "workout_completed",
      message: "Workout completed",
      timestamp,
    });

    return freezeResult(this.runtime, timestamp);
  }

  cancel(): WorkoutResult {
    const runtime = this.requireRuntime();
    this.assertTransition(runtime.state, "Cancelled");
    const timestamp = this.timestamp(runtime.configuration);
    this.runtime = this.withState(runtime, "Cancelled", {
      cancelledAt: timestamp,
      currentExerciseIndex: null,
      currentExerciseId: null,
      currentSetId: null,
      eventType: "workout_cancelled",
      message: "Workout cancelled",
      timestamp,
    });
    return freezeResult(this.runtime, timestamp);
  }

  completeSet(input: CompleteSetInput = {}): WorkoutRuntimeSummary {
    const runtime = this.requireRuntime();
    this.assertIssues(validateMutationAllowed(runtime));
    this.assertIssues(validateSetProgression(runtime));

    const exercise = getCurrentExercise(runtime);
    const currentSet = exercise ? getCurrentSet(exercise) : null;
    if (!exercise || !currentSet) {
      throw new WorkoutRuntimeError("no_current_set", "No current set");
    }

    const timestamp = this.timestamp(runtime.configuration);
    const completedSet = this.setBuilder.withPerformance(currentSet, input);

    let updatedExercise: ExerciseRuntime = this.recomputeExercise(
      this.replaceSet(exercise, completedSet),
      { keepCurrentIfIncomplete: true },
    );

    let nextExercises = this.replaceExercise(runtime.exercises, updatedExercise);
    let currentExerciseIndex = runtime.currentExerciseIndex;
    let currentExerciseId = runtime.currentExerciseId;
    let currentSetId: string | null = completedSet.id;
    let completedExerciseIds = [...runtime.completedExerciseIds];
    let events = [...runtime.events];

    events.push(
      this.createEvent({
        type: "set_completed",
        state: runtime.state,
        exerciseRuntimeId: exercise.id,
        setRuntimeId: completedSet.id,
        message: `Set ${completedSet.setIndex} completed`,
        timestamp,
      }),
    );

    const nextPending = updatedExercise.sets.find(
      (set) => set.state === "Pending",
    );

    if (nextPending) {
      const activated = this.setBuilder.withState(nextPending, "Active");
      updatedExercise = this.recomputeExercise(
        this.replaceSet(
          {
            ...updatedExercise,
            currentSetIndex: activated.setIndex,
          },
          activated,
        ),
        { forceState: "Active" },
      );
      nextExercises = this.replaceExercise(nextExercises, updatedExercise);
      currentSetId = activated.id;
      events.push(
        this.createEvent({
          type: "set_advanced",
          state: runtime.state,
          exerciseRuntimeId: updatedExercise.id,
          setRuntimeId: activated.id,
          message: `Advanced to set ${activated.setIndex}`,
          timestamp,
        }),
      );
    } else {
      updatedExercise = this.recomputeExercise(updatedExercise, {
        forceState: "Completed",
        clearCurrentSet: true,
      });
      nextExercises = this.replaceExercise(nextExercises, updatedExercise);
      completedExerciseIds = [...completedExerciseIds, updatedExercise.id];
      currentSetId = null;

      events.push(
        this.createEvent({
          type: "exercise_completed",
          state: runtime.state,
          exerciseRuntimeId: updatedExercise.id,
          setRuntimeId: null,
          message: `Exercise ${updatedExercise.name} completed`,
          timestamp,
        }),
      );

      const advanced = this.advanceToNextExercise(
        nextExercises,
        runtime.currentExerciseIndex ?? 0,
        timestamp,
        events,
      );
      nextExercises = advanced.exercises;
      currentExerciseIndex = advanced.currentExerciseIndex;
      currentExerciseId = advanced.currentExerciseId;
      currentSetId = advanced.currentSetId;
      events = [...advanced.events];
    }

    this.runtime = this.rebuild(runtime, {
      exercises: nextExercises,
      currentExerciseIndex,
      currentExerciseId,
      currentSetId,
      completedExerciseIds,
      events,
    });

    if (
      runtime.configuration.autoCompleteOnLastSet &&
      canAutoCompleteWorkout(this.runtime)
    ) {
      this.complete();
    }

    return this.summary();
  }

  skipExercise(): WorkoutRuntimeSummary {
    const runtime = this.requireRuntime();
    this.assertIssues(validateMutationAllowed(runtime));
    this.assertIssues(validateExerciseProgression(runtime));

    const exercise = getCurrentExercise(runtime);
    if (!exercise) {
      throw new WorkoutRuntimeError(
        "no_current_exercise",
        "No current exercise",
      );
    }

    const timestamp = this.timestamp(runtime.configuration);
    const skippedSets = exercise.sets.map((set) => {
      if (set.completed || set.state === "Skipped") {
        return set;
      }
      return Object.freeze({
        ...set,
        state: "Skipped" as const,
        completed: false,
      });
    });

    let updatedExercise = this.recomputeExercise(
      {
        ...exercise,
        sets: skippedSets,
        currentSetIndex: null,
      },
      { forceState: "Skipped", clearCurrentSet: true },
    );

    let nextExercises = this.replaceExercise(runtime.exercises, updatedExercise);
    let events = [
      ...runtime.events,
      this.createEvent({
        type: "exercise_skipped",
        state: runtime.state,
        exerciseRuntimeId: exercise.id,
        setRuntimeId: null,
        message: `Exercise ${exercise.name} skipped`,
        timestamp,
      }),
    ];

    const advanced = this.advanceToNextExercise(
      nextExercises,
      runtime.currentExerciseIndex ?? 0,
      timestamp,
      events,
    );

    this.runtime = this.rebuild(runtime, {
      exercises: advanced.exercises,
      currentExerciseIndex: advanced.currentExerciseIndex,
      currentExerciseId: advanced.currentExerciseId,
      currentSetId: advanced.currentSetId,
      skippedExerciseIds: [...runtime.skippedExerciseIds, updatedExercise.id],
      events: advanced.events,
    });

    if (
      runtime.configuration.autoCompleteOnLastExerciseSkip &&
      canAutoCompleteWorkout(this.runtime)
    ) {
      this.complete();
    }

    return this.summary();
  }

  getSummary(): WorkoutRuntimeSummary {
    return this.summary();
  }

  getSnapshot(): WorkoutRuntime {
    return freezeRuntime(this.requireRuntime());
  }

  getState(): WorkoutState {
    return this.requireRuntime().state;
  }

  isTerminal(): boolean {
    const state = this.runtime?.state;
    return state === "Completed" || state === "Cancelled";
  }

  private advanceToNextExercise(
    exercises: readonly ExerciseRuntime[],
    currentIndex: number,
    timestamp: string,
    events: WorkoutRuntimeEvent[],
  ): {
    readonly exercises: readonly ExerciseRuntime[];
    readonly currentExerciseIndex: number | null;
    readonly currentExerciseId: string | null;
    readonly currentSetId: string | null;
    readonly events: WorkoutRuntimeEvent[];
  } {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= exercises.length) {
      return {
        exercises,
        currentExerciseIndex: null,
        currentExerciseId: null,
        currentSetId: null,
        events,
      };
    }

    const next = exercises[nextIndex];
    if (!next) {
      return {
        exercises,
        currentExerciseIndex: null,
        currentExerciseId: null,
        currentSetId: null,
        events,
      };
    }

    const firstPending = next.sets.find((set) => set.state === "Pending");
    const activatedSets = next.sets.map((set) => {
      if (firstPending && set.id === firstPending.id) {
        return this.setBuilder.withState(set, "Active");
      }
      return set;
    });

    const activatedExercise = this.recomputeExercise(
      {
        ...next,
        sets: activatedSets,
        currentSetIndex: firstPending?.setIndex ?? null,
      },
      { forceState: "Active" },
    );

    const nextExercises = this.replaceExercise(exercises, activatedExercise);
    const currentSet =
      activatedExercise.currentSetIndex === null
        ? null
        : (activatedExercise.sets.find(
            (set) => set.setIndex === activatedExercise.currentSetIndex,
          ) ?? null);

    const nextEvents = [
      ...events,
      this.createEvent({
        type: "exercise_advanced",
        state: "Running",
        exerciseRuntimeId: activatedExercise.id,
        setRuntimeId: currentSet?.id ?? null,
        message: `Advanced to exercise ${activatedExercise.name}`,
        timestamp,
      }),
    ];

    return {
      exercises: nextExercises,
      currentExerciseIndex: nextIndex,
      currentExerciseId: activatedExercise.id,
      currentSetId: currentSet?.id ?? null,
      events: nextEvents,
    };
  }

  private recomputeExercise(
    exercise: {
      readonly id: string;
      readonly workoutExerciseId: string;
      readonly exerciseId: string;
      readonly name: string;
      readonly order: number;
      readonly sets: readonly SetRuntime[];
      readonly currentSetIndex: number | null;
      readonly state?: ExerciseRuntime["state"];
    },
    options: {
      readonly forceState?: ExerciseRuntime["state"];
      readonly clearCurrentSet?: boolean;
      readonly keepCurrentIfIncomplete?: boolean;
    } = {},
  ): ExerciseRuntime {
    const currentSetIndex = options.clearCurrentSet
      ? null
      : exercise.currentSetIndex;

    let state = options.forceState ?? exercise.state ?? "Pending";
    if (!options.forceState) {
      const allDone = exercise.sets.every(
        (set) => set.completed || set.state === "Skipped",
      );
      if (allDone) {
        state = "Completed";
      } else if (
        exercise.sets.some((set) => set.state === "Active") ||
        options.keepCurrentIfIncomplete
      ) {
        state = "Active";
      }
    }

    return this.exerciseBuilder.fromParts({
      id: exercise.id,
      workoutExerciseId: exercise.workoutExerciseId,
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      order: exercise.order,
      state,
      sets: exercise.sets,
      currentSetIndex,
    });
  }

  private replaceSet(
    exercise: {
      readonly id: string;
      readonly workoutExerciseId: string;
      readonly exerciseId: string;
      readonly name: string;
      readonly order: number;
      readonly sets: readonly SetRuntime[];
      readonly currentSetIndex: number | null;
      readonly state?: ExerciseRuntime["state"];
    },
    set: SetRuntime,
  ): {
    readonly id: string;
    readonly workoutExerciseId: string;
    readonly exerciseId: string;
    readonly name: string;
    readonly order: number;
    readonly sets: readonly SetRuntime[];
    readonly currentSetIndex: number | null;
    readonly state?: ExerciseRuntime["state"];
  } {
    return {
      id: exercise.id,
      workoutExerciseId: exercise.workoutExerciseId,
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      order: exercise.order,
      currentSetIndex: exercise.currentSetIndex,
      state: exercise.state,
      sets: exercise.sets.map((item) => (item.id === set.id ? set : item)),
    };
  }

  private replaceExercise(
    exercises: readonly ExerciseRuntime[],
    exercise: ExerciseRuntime,
  ): readonly ExerciseRuntime[] {
    return exercises.map((item) => (item.id === exercise.id ? exercise : item));
  }

  private withState(
    runtime: WorkoutRuntime,
    state: WorkoutState,
    options: {
      readonly startedAt?: string | null;
      readonly pausedAt?: string | null;
      readonly completedAt?: string | null;
      readonly cancelledAt?: string | null;
      readonly currentExerciseIndex?: number | null;
      readonly currentExerciseId?: string | null;
      readonly currentSetId?: string | null;
      readonly eventType: WorkoutRuntimeEventType;
      readonly message: string;
      readonly timestamp: string;
    },
  ): WorkoutRuntime {
    const events = [
      ...runtime.events,
      this.createEvent({
        type: options.eventType,
        state,
        exerciseRuntimeId: runtime.currentExerciseId,
        setRuntimeId: runtime.currentSetId,
        message: options.message,
        timestamp: options.timestamp,
      }),
    ];

    return this.rebuild(runtime, {
      state,
      startedAt:
        options.startedAt !== undefined ? options.startedAt : runtime.startedAt,
      pausedAt:
        options.pausedAt !== undefined ? options.pausedAt : runtime.pausedAt,
      completedAt:
        options.completedAt !== undefined
          ? options.completedAt
          : runtime.completedAt,
      cancelledAt:
        options.cancelledAt !== undefined
          ? options.cancelledAt
          : runtime.cancelledAt,
      currentExerciseIndex:
        options.currentExerciseIndex !== undefined
          ? options.currentExerciseIndex
          : runtime.currentExerciseIndex,
      currentExerciseId:
        options.currentExerciseId !== undefined
          ? options.currentExerciseId
          : runtime.currentExerciseId,
      currentSetId:
        options.currentSetId !== undefined
          ? options.currentSetId
          : runtime.currentSetId,
      events,
    });
  }

  private rebuild(
    runtime: WorkoutRuntime,
    patch: {
      readonly state?: WorkoutState;
      readonly exercises?: readonly ExerciseRuntime[];
      readonly currentExerciseIndex?: number | null;
      readonly currentExerciseId?: string | null;
      readonly currentSetId?: string | null;
      readonly completedExerciseIds?: readonly string[];
      readonly skippedExerciseIds?: readonly string[];
      readonly events?: readonly WorkoutRuntimeEvent[];
      readonly startedAt?: string | null;
      readonly pausedAt?: string | null;
      readonly completedAt?: string | null;
      readonly cancelledAt?: string | null;
    },
  ): WorkoutRuntime {
    return this.workoutBuilder.fromParts({
      id: runtime.id,
      session: runtime.session,
      state: patch.state ?? runtime.state,
      exercises: patch.exercises ?? runtime.exercises,
      currentExerciseIndex:
        patch.currentExerciseIndex !== undefined
          ? patch.currentExerciseIndex
          : runtime.currentExerciseIndex,
      currentExerciseId:
        patch.currentExerciseId !== undefined
          ? patch.currentExerciseId
          : runtime.currentExerciseId,
      currentSetId:
        patch.currentSetId !== undefined
          ? patch.currentSetId
          : runtime.currentSetId,
      completedExerciseIds:
        patch.completedExerciseIds ?? runtime.completedExerciseIds,
      skippedExerciseIds:
        patch.skippedExerciseIds ?? runtime.skippedExerciseIds,
      configuration: runtime.configuration,
      events: patch.events ?? runtime.events,
      restRuntime: runtime.restRuntime,
      startedAt:
        patch.startedAt !== undefined ? patch.startedAt : runtime.startedAt,
      pausedAt:
        patch.pausedAt !== undefined ? patch.pausedAt : runtime.pausedAt,
      completedAt:
        patch.completedAt !== undefined
          ? patch.completedAt
          : runtime.completedAt,
      cancelledAt:
        patch.cancelledAt !== undefined
          ? patch.cancelledAt
          : runtime.cancelledAt,
      pauseCount: this.pauseCount,
    });
  }

  private createEvent(input: {
    readonly type: WorkoutRuntimeEventType;
    readonly state: WorkoutState;
    readonly exerciseRuntimeId: string | null;
    readonly setRuntimeId: string | null;
    readonly message: string;
    readonly timestamp: string;
  }): WorkoutRuntimeEvent {
    this.eventSequence += 1;
    return Object.freeze({
      id: `event:${this.eventSequence}`,
      type: input.type,
      sequence: this.eventSequence,
      state: input.state,
      exerciseRuntimeId: input.exerciseRuntimeId,
      setRuntimeId: input.setRuntimeId,
      message: input.message,
      occurredAt: input.timestamp,
    });
  }

  private summary(): WorkoutRuntimeSummary {
    return freezeSummary(buildSummary(this.requireRuntime()));
  }

  private requireRuntime(): WorkoutRuntime {
    if (!this.runtime) {
      throw new WorkoutRuntimeError(
        "not_started",
        "Workout runtime has not been started",
      );
    }
    return this.runtime;
  }

  private assertTransition(from: WorkoutState, to: WorkoutState): void {
    if (!canTransitionWorkoutState(from, to)) {
      throw new WorkoutRuntimeError(
        "invalid_transition",
        `Cannot transition from ${from} to ${to}`,
      );
    }
  }

  private assertIssues(issues: readonly string[]): void {
    if (issues.length > 0) {
      throw new WorkoutRuntimeError("invalid_operation", issues.join("; "));
    }
  }

  private timestamp(configuration: WorkoutRuntimeConfiguration): string {
    return configuration.fixedTimestamp ?? DEFAULT_TIMESTAMP;
  }
}

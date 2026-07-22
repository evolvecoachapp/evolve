import {
  DomainEventBuilder,
  EventContextBuilder,
  type DomainEventSystem,
  type EventContext,
} from "../../../core/domain-events";
import type { ExerciseRuntime } from "../models/ExerciseRuntime";
import type { SetRuntime } from "../models/SetRuntime";
import type { WorkoutRuntime } from "../models/WorkoutRuntime";

/**
 * Emits domain events for workout lifecycle actions.
 * Does not alter workout business logic — emission only.
 */
export class WorkoutDomainEventEmitter {
  private readonly builder = new DomainEventBuilder();

  constructor(private readonly system: DomainEventSystem) {}

  getSystem(): DomainEventSystem {
    return this.system;
  }

  private context(
    runtime: WorkoutRuntime,
    extras: {
      readonly exerciseRuntimeId?: string | null;
      readonly setRuntimeId?: string | null;
    } = {},
  ): EventContext {
    return new EventContextBuilder()
      .from({
        sessionId: runtime.sessionId,
        workoutRuntimeId: runtime.id,
        exerciseRuntimeId:
          extras.exerciseRuntimeId !== undefined
            ? extras.exerciseRuntimeId
            : runtime.currentExerciseId,
        setRuntimeId:
          extras.setRuntimeId !== undefined
            ? extras.setRuntimeId
            : runtime.currentSetId,
        dayId: runtime.session.dayId,
        weekNumber: runtime.session.weekNumber,
      })
      .build();
  }

  emitWorkoutStarted(runtime: WorkoutRuntime, timestamp: string): void {
    const context = this.context(runtime);
    this.system.publishEvent(
      this.builder.workoutStarted({
        sequence: this.system.nextSequence(),
        timestamp,
        context,
        payload: {
          workoutRuntimeId: runtime.id,
          sessionId: runtime.sessionId,
        },
      }),
    );

    const exercise = runtime.exercises.find(
      (item) => item.id === runtime.currentExerciseId,
    );
    if (exercise) {
      this.emitExerciseStarted(runtime, exercise, timestamp);
      const set =
        exercise.sets.find((item) => item.id === runtime.currentSetId) ?? null;
      if (set) {
        this.emitSetStarted(runtime, exercise, set, timestamp);
      }
    }
  }

  emitWorkoutPaused(runtime: WorkoutRuntime, timestamp: string): void {
    this.system.publishEvent(
      this.builder.workoutLifecycle("workout_paused", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime),
        payload: {
          workoutRuntimeId: runtime.id,
          sessionId: runtime.sessionId,
          state: runtime.state,
        },
        message: "Workout paused",
      }),
    );
  }

  emitWorkoutResumed(runtime: WorkoutRuntime, timestamp: string): void {
    this.system.publishEvent(
      this.builder.workoutLifecycle("workout_resumed", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime),
        payload: {
          workoutRuntimeId: runtime.id,
          sessionId: runtime.sessionId,
          state: runtime.state,
        },
        message: "Workout resumed",
      }),
    );
  }

  emitWorkoutCompleted(runtime: WorkoutRuntime, timestamp: string): void {
    this.system.publishEvent(
      this.builder.workoutLifecycle("workout_completed", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime),
        payload: {
          workoutRuntimeId: runtime.id,
          sessionId: runtime.sessionId,
          state: runtime.state,
        },
        severity: "medium",
        message: "Workout completed",
      }),
    );
  }

  emitWorkoutCancelled(runtime: WorkoutRuntime, timestamp: string): void {
    this.system.publishEvent(
      this.builder.workoutLifecycle("workout_cancelled", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime),
        payload: {
          workoutRuntimeId: runtime.id,
          sessionId: runtime.sessionId,
          state: runtime.state,
        },
        severity: "high",
        message: "Workout cancelled",
      }),
    );
  }

  emitExerciseStarted(
    runtime: WorkoutRuntime,
    exercise: ExerciseRuntime,
    timestamp: string,
  ): void {
    this.system.publishEvent(
      this.builder.exerciseLifecycle("exercise_started", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime, {
          exerciseRuntimeId: exercise.id,
          setRuntimeId: runtime.currentSetId,
        }),
        payload: {
          workoutRuntimeId: runtime.id,
          exerciseRuntimeId: exercise.id,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          order: exercise.order,
        },
        message: `Exercise ${exercise.name} started`,
      }),
    );
  }

  emitExerciseCompleted(
    runtime: WorkoutRuntime,
    exercise: ExerciseRuntime,
    timestamp: string,
  ): void {
    this.system.publishEvent(
      this.builder.exerciseLifecycle("exercise_completed", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime, {
          exerciseRuntimeId: exercise.id,
          setRuntimeId: null,
        }),
        payload: {
          workoutRuntimeId: runtime.id,
          exerciseRuntimeId: exercise.id,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          order: exercise.order,
        },
        message: `Exercise ${exercise.name} completed`,
      }),
    );
  }

  emitExerciseSkipped(
    runtime: WorkoutRuntime,
    exercise: ExerciseRuntime,
    timestamp: string,
  ): void {
    this.system.publishEvent(
      this.builder.exerciseLifecycle("exercise_skipped", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime, {
          exerciseRuntimeId: exercise.id,
          setRuntimeId: null,
        }),
        payload: {
          workoutRuntimeId: runtime.id,
          exerciseRuntimeId: exercise.id,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          order: exercise.order,
        },
        message: `Exercise ${exercise.name} skipped`,
      }),
    );
  }

  emitSetStarted(
    runtime: WorkoutRuntime,
    exercise: ExerciseRuntime,
    set: SetRuntime,
    timestamp: string,
  ): void {
    this.system.publishEvent(
      this.builder.setLifecycle("set_started", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime, {
          exerciseRuntimeId: exercise.id,
          setRuntimeId: set.id,
        }),
        payload: {
          workoutRuntimeId: runtime.id,
          exerciseRuntimeId: exercise.id,
          setRuntimeId: set.id,
          setIndex: set.setIndex,
        },
        message: `Set ${set.setIndex} started`,
      }),
    );
  }

  emitSetCompleted(
    runtime: WorkoutRuntime,
    exercise: ExerciseRuntime,
    set: SetRuntime,
    timestamp: string,
  ): void {
    this.system.publishEvent(
      this.builder.setLifecycle("set_completed", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime, {
          exerciseRuntimeId: exercise.id,
          setRuntimeId: set.id,
        }),
        payload: {
          workoutRuntimeId: runtime.id,
          exerciseRuntimeId: exercise.id,
          setRuntimeId: set.id,
          setIndex: set.setIndex,
          weight: set.weight,
          repetitions: set.repetitions,
          rpe: set.rpe,
          rir: set.rir,
        },
        message: `Set ${set.setIndex} completed`,
      }),
    );
  }
}

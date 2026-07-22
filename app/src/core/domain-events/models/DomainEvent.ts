import type { EventCategory } from "./EventCategory";
import type { EventContext } from "./EventContext";
import type { EventMetadata } from "./EventMetadata";
import type { EventSequence } from "./EventSequence";
import type { EventSeverity } from "./EventSeverity";
import type { EventSource } from "./EventSource";
import type { DomainEventType } from "./DomainEventType";

/**
 * Shared fields for every immutable domain event.
 */
export interface DomainEventBase {
  readonly id: string;
  readonly type: DomainEventType;
  readonly category: EventCategory;
  readonly severity: EventSeverity;
  readonly source: EventSource;
  readonly sequence: EventSequence;
  readonly timestamp: string;
  readonly metadata: EventMetadata;
  readonly context: EventContext;
  readonly message: string;
}

export interface WorkoutStartedPayload {
  readonly workoutRuntimeId: string;
  readonly sessionId: string;
}

export interface WorkoutLifecyclePayload {
  readonly workoutRuntimeId: string;
  readonly sessionId: string;
  readonly state: string;
}

export interface ExerciseLifecyclePayload {
  readonly workoutRuntimeId: string;
  readonly exerciseRuntimeId: string;
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly order: number;
}

export interface SetLifecyclePayload {
  readonly workoutRuntimeId: string;
  readonly exerciseRuntimeId: string;
  readonly setRuntimeId: string;
  readonly setIndex: number;
  readonly weight?: number | null;
  readonly repetitions?: number | null;
  readonly rpe?: number | null;
  readonly rir?: number | null;
}

export interface RestLifecyclePayload {
  readonly restRuntimeId: string;
  readonly sessionId: string;
  readonly workoutRuntimeId: string | null;
  readonly elapsedMs: number;
  readonly targetDurationMs: number;
  readonly state: string;
}

export interface WorkoutStartedEvent extends DomainEventBase {
  readonly type: "workout_started";
  readonly category: "workout";
  readonly payload: WorkoutStartedPayload;
}

export interface WorkoutPausedEvent extends DomainEventBase {
  readonly type: "workout_paused";
  readonly category: "workout";
  readonly payload: WorkoutLifecyclePayload;
}

export interface WorkoutResumedEvent extends DomainEventBase {
  readonly type: "workout_resumed";
  readonly category: "workout";
  readonly payload: WorkoutLifecyclePayload;
}

export interface WorkoutCompletedEvent extends DomainEventBase {
  readonly type: "workout_completed";
  readonly category: "workout";
  readonly payload: WorkoutLifecyclePayload;
}

export interface WorkoutCancelledEvent extends DomainEventBase {
  readonly type: "workout_cancelled";
  readonly category: "workout";
  readonly payload: WorkoutLifecyclePayload;
}

export interface ExerciseStartedEvent extends DomainEventBase {
  readonly type: "exercise_started";
  readonly category: "exercise";
  readonly payload: ExerciseLifecyclePayload;
}

export interface ExerciseCompletedEvent extends DomainEventBase {
  readonly type: "exercise_completed";
  readonly category: "exercise";
  readonly payload: ExerciseLifecyclePayload;
}

export interface ExerciseSkippedEvent extends DomainEventBase {
  readonly type: "exercise_skipped";
  readonly category: "exercise";
  readonly payload: ExerciseLifecyclePayload;
}

export interface SetStartedEvent extends DomainEventBase {
  readonly type: "set_started";
  readonly category: "set";
  readonly payload: SetLifecyclePayload;
}

export interface SetCompletedEvent extends DomainEventBase {
  readonly type: "set_completed";
  readonly category: "set";
  readonly payload: SetLifecyclePayload;
}

export interface RestStartedEvent extends DomainEventBase {
  readonly type: "rest_started";
  readonly category: "rest";
  readonly payload: RestLifecyclePayload;
}

export interface RestPausedEvent extends DomainEventBase {
  readonly type: "rest_paused";
  readonly category: "rest";
  readonly payload: RestLifecyclePayload;
}

export interface RestResumedEvent extends DomainEventBase {
  readonly type: "rest_resumed";
  readonly category: "rest";
  readonly payload: RestLifecyclePayload;
}

export interface RestCompletedEvent extends DomainEventBase {
  readonly type: "rest_completed";
  readonly category: "rest";
  readonly payload: RestLifecyclePayload;
}

export interface RestCancelledEvent extends DomainEventBase {
  readonly type: "rest_cancelled";
  readonly category: "rest";
  readonly payload: RestLifecyclePayload;
}

/**
 * Discriminated union of all strongly typed workout-execution domain events.
 */
export type DomainEvent =
  | WorkoutStartedEvent
  | WorkoutPausedEvent
  | WorkoutResumedEvent
  | WorkoutCompletedEvent
  | WorkoutCancelledEvent
  | ExerciseStartedEvent
  | ExerciseCompletedEvent
  | ExerciseSkippedEvent
  | SetStartedEvent
  | SetCompletedEvent
  | RestStartedEvent
  | RestPausedEvent
  | RestResumedEvent
  | RestCompletedEvent
  | RestCancelledEvent;

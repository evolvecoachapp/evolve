import type {
  DomainEvent,
  ExerciseLifecyclePayload,
  RestLifecyclePayload,
  SetLifecyclePayload,
  WorkoutLifecyclePayload,
  WorkoutStartedPayload,
} from "../models/DomainEvent";
import type { DomainEventType } from "../models/DomainEventType";
import { categoryForEventType } from "../models/DomainEventType";
import type { EventContext } from "../models/EventContext";
import type { EventMetadata } from "../models/EventMetadata";
import { EMPTY_EVENT_METADATA } from "../models/EventMetadata";
import type { EventSeverity } from "../models/EventSeverity";
import type { EventSource } from "../models/EventSource";
import { DomainEventError } from "../models/DomainEventError";
import { freezeEvent } from "../utils/freezeEvents";
import { normalizeMetadata } from "../utils/normalizeMetadata";
import { EventContextBuilder } from "./EventContextBuilder";

export interface BuildDomainEventInput {
  readonly id?: string;
  readonly type: DomainEventType;
  readonly sequence: number;
  readonly timestamp: string;
  readonly source: EventSource;
  readonly severity?: EventSeverity;
  readonly message: string;
  readonly context: EventContext;
  readonly metadata?: Partial<EventMetadata> | null;
  readonly payload:
    | WorkoutStartedPayload
    | WorkoutLifecyclePayload
    | ExerciseLifecyclePayload
    | SetLifecyclePayload
    | RestLifecyclePayload;
}

/**
 * Build strongly typed, immutable domain events.
 */
export class DomainEventBuilder {
  build(input: BuildDomainEventInput): DomainEvent {
    const category = categoryForEventType(input.type);
    const metadata = normalizeMetadata(input.metadata ?? EMPTY_EVENT_METADATA);
    const context =
      input.context ??
      new EventContextBuilder().withSessionId("unknown").build();

    const base = {
      id: input.id ?? `domain-event:${input.sequence}`,
      type: input.type,
      category,
      severity: input.severity ?? "info",
      source: input.source,
      sequence: input.sequence,
      timestamp: input.timestamp,
      metadata,
      context,
      message: input.message,
      payload: Object.freeze({ ...input.payload }),
    };

    const event = freezeEvent(base as DomainEvent);

    if (event.category !== category) {
      throw new DomainEventError(
        "invalid_event_type",
        `Category mismatch for ${input.type}`,
      );
    }

    return event;
  }

  workoutStarted(input: {
    readonly sequence: number;
    readonly timestamp: string;
    readonly context: EventContext;
    readonly payload: WorkoutStartedPayload;
    readonly metadata?: Partial<EventMetadata> | null;
    readonly message?: string;
  }): DomainEvent {
    return this.build({
      type: "workout_started",
      sequence: input.sequence,
      timestamp: input.timestamp,
      source: "workout-runtime",
      context: input.context,
      metadata: input.metadata,
      message: input.message ?? "Workout started",
      payload: input.payload,
    });
  }

  workoutLifecycle(
    type:
      | "workout_paused"
      | "workout_resumed"
      | "workout_completed"
      | "workout_cancelled",
    input: {
      readonly sequence: number;
      readonly timestamp: string;
      readonly context: EventContext;
      readonly payload: WorkoutLifecyclePayload;
      readonly metadata?: Partial<EventMetadata> | null;
      readonly message?: string;
      readonly severity?: EventSeverity;
    },
  ): DomainEvent {
    return this.build({
      type,
      sequence: input.sequence,
      timestamp: input.timestamp,
      source: "workout-runtime",
      severity: input.severity,
      context: input.context,
      metadata: input.metadata,
      message:
        input.message ??
        type
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
      payload: input.payload,
    });
  }

  exerciseLifecycle(
    type: "exercise_started" | "exercise_completed" | "exercise_skipped",
    input: {
      readonly sequence: number;
      readonly timestamp: string;
      readonly context: EventContext;
      readonly payload: ExerciseLifecyclePayload;
      readonly metadata?: Partial<EventMetadata> | null;
      readonly message?: string;
    },
  ): DomainEvent {
    return this.build({
      type,
      sequence: input.sequence,
      timestamp: input.timestamp,
      source: "workout-runtime",
      context: input.context,
      metadata: input.metadata,
      message: input.message ?? `Exercise ${type.replace("exercise_", "")}`,
      payload: input.payload,
    });
  }

  setLifecycle(
    type: "set_started" | "set_completed",
    input: {
      readonly sequence: number;
      readonly timestamp: string;
      readonly context: EventContext;
      readonly payload: SetLifecyclePayload;
      readonly metadata?: Partial<EventMetadata> | null;
      readonly message?: string;
    },
  ): DomainEvent {
    return this.build({
      type,
      sequence: input.sequence,
      timestamp: input.timestamp,
      source: "workout-runtime",
      context: input.context,
      metadata: input.metadata,
      message: input.message ?? `Set ${type.replace("set_", "")}`,
      payload: input.payload,
    });
  }

  restLifecycle(
    type:
      | "rest_started"
      | "rest_paused"
      | "rest_resumed"
      | "rest_completed"
      | "rest_cancelled",
    input: {
      readonly sequence: number;
      readonly timestamp: string;
      readonly context: EventContext;
      readonly payload: RestLifecyclePayload;
      readonly metadata?: Partial<EventMetadata> | null;
      readonly message?: string;
    },
  ): DomainEvent {
    return this.build({
      type,
      sequence: input.sequence,
      timestamp: input.timestamp,
      source: "rest-runtime",
      context: input.context,
      metadata: input.metadata,
      message:
        input.message ??
        type
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
      payload: input.payload,
    });
  }
}

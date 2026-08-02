import {
  createWorkoutProgressResult,
  createWorkoutProgressSnapshot,
  type WorkoutProgressEvent,
  type WorkoutProgressResult,
  type WorkoutProgressSnapshot,
} from "../models";
import { validateWorkoutProgressEvent } from "../validation";
import type {
  WorkoutProgressEventSubscriber,
  WorkoutProgressPublisher as WorkoutProgressPublisherContract,
} from "./WorkoutProgressPublisher";

export class DefaultWorkoutProgressPublisher implements WorkoutProgressPublisherContract {
  readonly id = "workout-progress-publisher";

  private readonly publishedEventIds = new Set<string>();
  private lastEvent: WorkoutProgressEvent | null = null;

  constructor(
    private readonly subscribers: readonly WorkoutProgressEventSubscriber[] = [],
  ) {}

  async publish(event: WorkoutProgressEvent): Promise<WorkoutProgressResult> {
    validateWorkoutProgressEvent({
      event,
      publishedEventIds: [...this.publishedEventIds],
    });

    const frozenEvent = Object.freeze({
      ...event,
      metadata: Object.freeze({ ...event.metadata }),
      payload: Object.freeze({
        ...event.payload,
        metrics: Object.freeze([...event.payload.metrics]),
      }),
    });

    this.publishedEventIds.add(frozenEvent.id);
    this.lastEvent = frozenEvent;

    const subscriberResults = await Promise.all(
      this.subscribers.map((subscriber) => subscriber.onEvent(frozenEvent)),
    );

    return createWorkoutProgressResult({
      eventId: frozenEvent.id,
      accepted: true,
      publishedAt: frozenEvent.metadata.publishedAt,
      subscriberResults: Object.freeze([...subscriberResults]),
    });
  }

  getPublishedEventIds(): readonly string[] {
    return Object.freeze([...this.publishedEventIds]);
  }

  getSnapshot(): WorkoutProgressSnapshot {
    return createWorkoutProgressSnapshot({
      publishedEventCount: this.publishedEventIds.size,
      lastEventId: this.lastEvent?.id ?? null,
      lastEventType: this.lastEvent?.type ?? null,
      capturedAt: this.lastEvent?.metadata.publishedAt ?? new Date(0).toISOString(),
    });
  }
}


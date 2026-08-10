import {
  createGoalProgressResult,
  createGoalProgressSnapshot,
  type GoalProgressEvent,
  type GoalProgressResult,
  type GoalProgressSnapshot,
} from "../models";
import { validateGoalProgressEvent } from "../validation";
import type {
  GoalProgressEventSubscriber,
  GoalProgressPublisher as GoalProgressPublisherContract,
} from "./GoalProgressPublisher";

export class DefaultGoalProgressPublisher implements GoalProgressPublisherContract {
  readonly id = "goal-progress-publisher";

  private readonly publishedEventIds = new Set<string>();
  private lastEvent: GoalProgressEvent | null = null;

  constructor(
    private readonly subscribers: readonly GoalProgressEventSubscriber[] = [],
  ) {}

  async publish(event: GoalProgressEvent): Promise<GoalProgressResult> {
    validateGoalProgressEvent({
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

    return createGoalProgressResult({
      eventId: frozenEvent.id,
      accepted: true,
      publishedAt: frozenEvent.metadata.publishedAt,
      subscriberResults: Object.freeze([...subscriberResults]),
    });
  }

  getPublishedEventIds(): readonly string[] {
    return Object.freeze([...this.publishedEventIds]);
  }

  getSnapshot(): GoalProgressSnapshot {
    return createGoalProgressSnapshot({
      publishedEventCount: this.publishedEventIds.size,
      lastEventId: this.lastEvent?.id ?? null,
      lastEventType: this.lastEvent?.type ?? null,
      capturedAt: this.lastEvent?.metadata.publishedAt ?? new Date(0).toISOString(),
    });
  }
}

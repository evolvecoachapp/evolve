import {
  createRecoveryProgressResult,
  createRecoveryProgressSnapshot,
  type RecoveryProgressEvent,
  type RecoveryProgressResult,
  type RecoveryProgressSnapshot,
} from "../models";
import { validateRecoveryProgressEvent } from "../validation";
import type {
  RecoveryProgressEventSubscriber,
  RecoveryProgressPublisher as RecoveryProgressPublisherContract,
} from "./RecoveryProgressPublisher";

export class DefaultRecoveryProgressPublisher implements RecoveryProgressPublisherContract {
  readonly id = "recovery-progress-publisher";

  private readonly publishedEventIds = new Set<string>();
  private lastEvent: RecoveryProgressEvent | null = null;

  constructor(
    private readonly subscribers: readonly RecoveryProgressEventSubscriber[] = [],
  ) {}

  async publish(event: RecoveryProgressEvent): Promise<RecoveryProgressResult> {
    validateRecoveryProgressEvent({
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

    return createRecoveryProgressResult({
      eventId: frozenEvent.id,
      accepted: true,
      publishedAt: frozenEvent.metadata.publishedAt,
      subscriberResults: Object.freeze([...subscriberResults]),
    });
  }

  getPublishedEventIds(): readonly string[] {
    return Object.freeze([...this.publishedEventIds]);
  }

  getSnapshot(): RecoveryProgressSnapshot {
    return createRecoveryProgressSnapshot({
      publishedEventCount: this.publishedEventIds.size,
      lastEventId: this.lastEvent?.id ?? null,
      lastEventType: this.lastEvent?.type ?? null,
      capturedAt: this.lastEvent?.metadata.publishedAt ?? new Date(0).toISOString(),
    });
  }
}

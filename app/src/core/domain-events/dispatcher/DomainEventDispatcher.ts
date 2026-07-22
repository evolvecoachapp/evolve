import type { DomainEvent } from "../models/DomainEvent";
import { DomainEventError } from "../models/DomainEventError";
import type { EventStreamStore } from "../stream/EventStreamStore";
import type {
  DomainEventSubscriber,
  Unsubscribe,
} from "../subscribers/DomainEventSubscriber";
import { freezeEvent } from "../utils/freezeEvents";
import { validateEvent } from "../validators/validateEvent";

/**
 * Synchronous domain event dispatcher.
 *
 * Publishes events into an EventStreamStore, then notifies subscribers
 * in subscription order. No queues, brokers, or async processing.
 */
export class DomainEventDispatcher {
  private readonly subscribers = new Map<string, DomainEventSubscriber>();
  private readonly subscriptionOrder: string[] = [];
  private sealed = false;

  constructor(private readonly store: EventStreamStore) {}

  get isSealed(): boolean {
    return this.sealed;
  }

  /**
   * Freeze, validate, append, and notify subscribers synchronously.
   */
  publish(event: DomainEvent): DomainEvent {
    this.assertOpen();

    const frozen = freezeEvent(event);
    const issues = validateEvent(frozen);
    if (issues.length > 0) {
      const code = issues[0]?.startsWith("missing_metadata")
        ? "missing_metadata"
        : issues[0]?.startsWith("missing_context")
          ? "missing_context"
          : issues[0]?.startsWith("invalid_timestamp")
            ? "invalid_timestamp"
            : issues[0]?.startsWith("mutable_payload")
              ? "mutable_payload"
              : issues[0]?.startsWith("invalid_event_type")
                ? "invalid_event_type"
                : "invalid_event";
      throw new DomainEventError(code, issues.join("; "));
    }

    const stored = this.store.append(frozen);

    for (const subscriberId of this.subscriptionOrder) {
      const subscriber = this.subscribers.get(subscriberId);
      if (subscriber) {
        subscriber.onEvent(stored);
      }
    }

    return stored;
  }

  /**
   * Register a subscriber. Returns an unsubscribe function.
   */
  subscribe(subscriber: DomainEventSubscriber): Unsubscribe {
    this.assertOpen();

    if (this.subscribers.has(subscriber.id)) {
      throw new DomainEventError(
        "invalid_event",
        `Subscriber already registered: ${subscriber.id}`,
      );
    }

    this.subscribers.set(subscriber.id, subscriber);
    this.subscriptionOrder.push(subscriber.id);

    return () => {
      this.unsubscribe(subscriber.id);
    };
  }

  unsubscribe(subscriberId: string): void {
    if (!this.subscribers.has(subscriberId)) {
      throw new DomainEventError(
        "unknown_subscriber",
        `Unknown subscriber: ${subscriberId}`,
      );
    }

    this.subscribers.delete(subscriberId);
    const index = this.subscriptionOrder.indexOf(subscriberId);
    if (index >= 0) {
      this.subscriptionOrder.splice(index, 1);
    }
  }

  getSubscriberIds(): readonly string[] {
    return Object.freeze([...this.subscriptionOrder]);
  }

  /**
   * Prevent further publishes / subscriptions (terminal sessions).
   */
  seal(): void {
    this.sealed = true;
  }

  private assertOpen(): void {
    if (this.sealed) {
      throw new DomainEventError(
        "dispatcher_sealed",
        "DomainEventDispatcher is sealed",
      );
    }
  }
}

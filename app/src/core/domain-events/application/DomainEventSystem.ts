import { DomainEventBuilder } from "../builders/DomainEventBuilder";
import { DomainEventDispatcher } from "../dispatcher/DomainEventDispatcher";
import type { DomainEvent } from "../models/DomainEvent";
import type { EventStream, EventStreamSummary } from "../models/EventStream";
import { EventStreamStore } from "../stream/EventStreamStore";
import type {
  DomainEventSubscriber,
  Unsubscribe,
} from "../subscribers/DomainEventSubscriber";
import { summarizeStream } from "../utils/summarizeStream";

const FIXED_TIMESTAMP = "2026-07-22T00:00:00.000Z";

export interface CreateDomainEventSystemOptions {
  readonly streamId?: string;
  readonly sessionId?: string;
  readonly createdAt?: string;
}

/**
 * Session-scoped domain event system.
 *
 * Owns the stream store and synchronous dispatcher.
 * Internal dispatcher is not exported through the public application API.
 */
export class DomainEventSystem {
  private readonly store: EventStreamStore;
  private readonly dispatcher: DomainEventDispatcher;
  readonly eventBuilder: DomainEventBuilder;

  constructor(options: CreateDomainEventSystemOptions = {}) {
    const sessionId = options.sessionId ?? "session:domain-events";
    this.store = new EventStreamStore(
      options.streamId ?? `event-stream:${sessionId}`,
      sessionId,
      options.createdAt ?? FIXED_TIMESTAMP,
    );
    this.dispatcher = new DomainEventDispatcher(this.store);
    this.eventBuilder = new DomainEventBuilder();
  }

  /**
   * Allocate the next sequence number for event construction.
   */
  nextSequence(): number {
    return this.store.nextSequence();
  }

  publishEvent(event: DomainEvent): DomainEvent {
    return this.dispatcher.publish(event);
  }

  subscribe(subscriber: DomainEventSubscriber): Unsubscribe {
    return this.dispatcher.subscribe(subscriber);
  }

  unsubscribe(subscriberId: string): void {
    this.dispatcher.unsubscribe(subscriberId);
  }

  getEventStream(): EventStream {
    return this.store.getStream();
  }

  summarizeEvents(): EventStreamSummary {
    return summarizeStream(this.store.getStream());
  }

  filterByCategory(category: EventStream["events"][number]["category"]) {
    return this.store.filterByCategory(category);
  }

  filterBySource(source: EventStream["events"][number]["source"]) {
    return this.store.filterBySource(source);
  }

  filterByType(type: EventStream["events"][number]["type"]) {
    return this.store.filterByType(type);
  }

  seal(): void {
    this.dispatcher.seal();
  }
}

export function createDomainEventSystem(
  options: CreateDomainEventSystemOptions = {},
): DomainEventSystem {
  return new DomainEventSystem(options);
}

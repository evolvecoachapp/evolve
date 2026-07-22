import type { DomainEvent } from "../models/DomainEvent";
import type { EventStream, EventStreamSummary } from "../models/EventStream";
import type {
  DomainEventSubscriber,
  Unsubscribe,
} from "../subscribers/DomainEventSubscriber";
import {
  createDomainEventSystem,
  DomainEventSystem,
  type CreateDomainEventSystemOptions,
} from "./DomainEventSystem";

let defaultSystem: DomainEventSystem | null = null;

function resolveSystem(system?: DomainEventSystem): DomainEventSystem {
  if (system) {
    return system;
  }
  if (!defaultSystem) {
    defaultSystem = createDomainEventSystem();
  }
  return defaultSystem;
}

/**
 * Reset the process-default system (tests only).
 */
export function resetDefaultDomainEventSystem(): void {
  defaultSystem = null;
}

/**
 * Replace / create the process-default system.
 */
export function configureDefaultDomainEventSystem(
  options: CreateDomainEventSystemOptions = {},
): DomainEventSystem {
  defaultSystem = createDomainEventSystem(options);
  return defaultSystem;
}

/**
 * Public API — publish an immutable domain event.
 */
export function publishEvent(
  event: DomainEvent,
  system?: DomainEventSystem,
): DomainEvent {
  return resolveSystem(system).publishEvent(event);
}

/**
 * Public API — subscribe a synchronous domain-event consumer.
 */
export function subscribe(
  subscriber: DomainEventSubscriber,
  system?: DomainEventSystem,
): Unsubscribe {
  return resolveSystem(system).subscribe(subscriber);
}

/**
 * Public API — remove a subscriber by id.
 */
export function unsubscribe(
  subscriberId: string,
  system?: DomainEventSystem,
): void {
  resolveSystem(system).unsubscribe(subscriberId);
}

/**
 * Public API — read-only event stream snapshot.
 */
export function getEventStream(system?: DomainEventSystem): EventStream {
  return resolveSystem(system).getEventStream();
}

/**
 * Public API — summarize the current event stream.
 */
export function summarizeEvents(
  system?: DomainEventSystem,
): EventStreamSummary {
  return resolveSystem(system).summarizeEvents();
}

export {
  createDomainEventSystem,
  DomainEventSystem,
  type CreateDomainEventSystemOptions,
};

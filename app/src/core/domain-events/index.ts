/**
 * Domain Event System (Sprint 18.2).
 *
 * Strongly typed, immutable domain events for workout execution.
 * Not an event bus, message broker, queue, or networking layer.
 *
 * Workout Runtime → Rest Runtime → Domain Events → Event Stream → Future Subscribers
 */

export * from "./models";
export * from "./stream";
export * from "./dispatcher";
export * from "./subscribers";
export * from "./builders";
export * from "./validators";
export * from "./utils";
export {
  createDomainEventSystem,
  configureDefaultDomainEventSystem,
  resetDefaultDomainEventSystem,
  DomainEventSystem,
  publishEvent,
  subscribe,
  unsubscribe,
  getEventStream,
  summarizeEvents,
  type CreateDomainEventSystemOptions,
} from "./application";

import type { DomainEventSubscriber } from "./DomainEventSubscriber";

/**
 * Future consumer: Performance Engine.
 * Interface only — no implementation in this sprint.
 */
export interface PerformanceSubscriber extends DomainEventSubscriber {
  readonly kind: "performance";
}

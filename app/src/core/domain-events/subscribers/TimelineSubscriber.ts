import type { DomainEventSubscriber } from "./DomainEventSubscriber";

/**
 * Future consumer: Timeline.
 * Interface only — no implementation in this sprint.
 */
export interface TimelineSubscriber extends DomainEventSubscriber {
  readonly kind: "timeline";
}

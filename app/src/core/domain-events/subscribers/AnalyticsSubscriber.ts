import type { DomainEventSubscriber } from "./DomainEventSubscriber";

/**
 * Future consumer: Analytics.
 * Interface only — no implementation in this sprint.
 */
export interface AnalyticsSubscriber extends DomainEventSubscriber {
  readonly kind: "analytics";
}

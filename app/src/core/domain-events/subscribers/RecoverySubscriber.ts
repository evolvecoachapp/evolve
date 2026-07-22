import type { DomainEventSubscriber } from "./DomainEventSubscriber";

/**
 * Future consumer: Recovery.
 * Interface only — no implementation in this sprint.
 */
export interface RecoverySubscriber extends DomainEventSubscriber {
  readonly kind: "recovery";
}

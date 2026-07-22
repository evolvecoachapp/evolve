import type { DomainEventSubscriber } from "./DomainEventSubscriber";

/**
 * Future consumer: Coach AI.
 * Interface only — no implementation in this sprint.
 */
export interface CoachSubscriber extends DomainEventSubscriber {
  readonly kind: "coach";
}

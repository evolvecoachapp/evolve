import type { DomainEventSubscriber } from "./DomainEventSubscriber";

/**
 * Future consumer: Achievements.
 * Interface only — no implementation in this sprint.
 */
export interface AchievementSubscriber extends DomainEventSubscriber {
  readonly kind: "achievement";
}

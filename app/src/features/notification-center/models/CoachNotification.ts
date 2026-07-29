import type { NotificationCategory } from "./NotificationCategory";
import type { NotificationPriority } from "./NotificationPriority";
import type { NotificationState } from "./NotificationState";

export interface CoachNotification {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly category: NotificationCategory;
  readonly priority: NotificationPriority;
  readonly state: NotificationState;
  readonly coachContext: string | null;
  readonly actionDestination: string | null;
  readonly createdAt: string;
  readonly readAt: string | null;
}

export function createCoachNotification(input: CoachNotification): CoachNotification {
  return Object.freeze({ ...input });
}

import type { NotificationAction } from "./NotificationAction";
import type { NotificationCategory } from "./NotificationCategory";
import type { NotificationPriority } from "./NotificationPriority";
import type { NotificationState } from "./NotificationState";

export interface NotificationItem {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly category: NotificationCategory;
  readonly priority: NotificationPriority;
  readonly state: NotificationState;
  readonly icon: string;
  readonly createdAt: string;
  readonly readAt: string | null;
  readonly expiresAt: string | null;
  readonly actions: readonly NotificationAction[];
  readonly destination: string | null;
}

export function createNotificationItem(input: NotificationItem): NotificationItem {
  return Object.freeze({
    ...input,
    actions: Object.freeze([...input.actions]),
  });
}

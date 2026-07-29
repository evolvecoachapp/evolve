import type { NotificationCategory } from "./NotificationCategory";

export interface NotificationAction {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly destination: string | null;
  readonly category: NotificationCategory;
}

export function createNotificationAction(input: NotificationAction): NotificationAction {
  return Object.freeze({ ...input });
}

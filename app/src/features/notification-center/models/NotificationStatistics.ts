export interface NotificationStatistics {
  readonly totalNotifications: number;
  readonly unreadCount: number;
  readonly dismissedCount: number;
  readonly activeReminders: number;
  readonly deliveredToday: number;
  readonly pendingCount: number;
}

export function createNotificationStatistics(input: NotificationStatistics): NotificationStatistics {
  return Object.freeze({ ...input });
}

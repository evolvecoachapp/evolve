import type { CoachNotification } from "../shared/models/CoachNotification"
import type { NotificationStore } from "./types"

export class InMemoryNotificationStore implements NotificationStore {
  private notifications: CoachNotification[] = []

  saveNotifications(notifications: CoachNotification[]): void {
    this.notifications = [...this.notifications, ...notifications]
  }

  getNotifications(): CoachNotification[] {
    return [...this.notifications]
  }

  getUnreadCount(): number {
    return this.notifications.filter((notification) => !notification.read).length
  }

  markAsRead(notificationId: string): void {
    this.notifications = this.notifications.map((notification) =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    )
  }

  clear(): void {
    this.notifications = []
  }
}

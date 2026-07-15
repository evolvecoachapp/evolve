import type { RecommendationFeed } from "../recommendations/types"
import type { CoachNotification } from "../shared/models/CoachNotification"

export interface NotificationGenerator {
  generateNotifications(feed: RecommendationFeed): CoachNotification[]
}

export interface NotificationStore {
  saveNotifications(notifications: CoachNotification[]): void
  getNotifications(): CoachNotification[]
  getUnreadCount(): number
  markAsRead(notificationId: string): void
  clear(): void
}

export type NotificationType =
  | "workout_reminder"
  | "nutrition_reminder"
  | "recovery_alert"
  | "coach_message"

export type NotificationPriority = "low" | "medium" | "high"

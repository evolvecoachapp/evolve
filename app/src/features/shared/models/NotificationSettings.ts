export type NotificationChannel = "push" | "email" | "in_app";

/** Notification delivery preferences scoped to coaching and fitness reminders. */
export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  workoutReminders: boolean;
  nutritionReminders: boolean;
  hydrationReminders: boolean;
  coachMessages: boolean;
  progressUpdates: boolean;
  recoveryAlerts: boolean;
  marketing: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  preferredChannels: NotificationChannel[];
}

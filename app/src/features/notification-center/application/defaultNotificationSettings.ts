import type { NotificationSettingsDto } from "../services";

/** Default settings when profile notification prefs are not yet persisted (ADR-135). */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsDto = Object.freeze({
  workoutReminders: false,
  nutritionReminders: false,
  hydrationReminders: false,
  recoveryReminders: false,
  sleepReminders: false,
  coachMessages: false,
  progressUpdates: false,
  globalDeliveryPolicy: "manual",
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
});

import type { DeliveryPolicy } from "./DeliveryPolicy";

export interface NotificationSettings {
  readonly workoutReminders: boolean;
  readonly nutritionReminders: boolean;
  readonly hydrationReminders: boolean;
  readonly recoveryReminders: boolean;
  readonly sleepReminders: boolean;
  readonly coachMessages: boolean;
  readonly progressUpdates: boolean;
  readonly globalDeliveryPolicy: DeliveryPolicy;
  readonly quietHoursEnabled: boolean;
  readonly quietHoursStart: string;
  readonly quietHoursEnd: string;
}

export function createNotificationSettings(input: NotificationSettings): NotificationSettings {
  return Object.freeze({ ...input });
}

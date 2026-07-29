export interface NotificationPreferences {
  readonly workoutReminders: boolean;
  readonly mealReminders: boolean;
  readonly hydrationReminders: boolean;
  readonly coachMessages: boolean;
  readonly progressUpdates: boolean;
  readonly destination: string | null;
}

export function createNotificationPreferences(input: NotificationPreferences): NotificationPreferences {
  return Object.freeze({ ...input });
}

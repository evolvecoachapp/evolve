export const NotificationCategories = {
  REMINDER: "reminder",
  COACH: "coach",
  PROGRESS: "progress",
  SYSTEM: "system",
  SOCIAL: "social",
} as const;

export type NotificationCategory = (typeof NotificationCategories)[keyof typeof NotificationCategories];

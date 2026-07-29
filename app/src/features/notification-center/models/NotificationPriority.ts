export const NotificationPriorities = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type NotificationPriority = (typeof NotificationPriorities)[keyof typeof NotificationPriorities];

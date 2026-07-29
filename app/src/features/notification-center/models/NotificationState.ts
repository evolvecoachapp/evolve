export const NotificationStates = {
  PENDING: "pending",
  SCHEDULED: "scheduled",
  DELIVERED: "delivered",
  DISMISSED: "dismissed",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

export type NotificationState = (typeof NotificationStates)[keyof typeof NotificationStates];

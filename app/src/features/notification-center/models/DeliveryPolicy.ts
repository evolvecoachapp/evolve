export const DeliveryPolicies = {
  IMMEDIATE: "immediate",
  SCHEDULED: "scheduled",
  DAILY: "daily",
  WEEKLY: "weekly",
  MANUAL: "manual",
  DISABLED: "disabled",
} as const;

export type DeliveryPolicy = (typeof DeliveryPolicies)[keyof typeof DeliveryPolicies];

export const TimelineCategories = {
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  COACH: "coach",
  PROFILE: "profile",
  NOTIFICATIONS: "notifications",
  ANALYTICS: "analytics",
  ACHIEVEMENTS: "achievements",
  SYNCHRONIZATION: "synchronization",
  CUSTOM: "custom",
} as const;

export type TimelineCategory = (typeof TimelineCategories)[keyof typeof TimelineCategories];

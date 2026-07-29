export const ReminderTypes = {
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  HYDRATION: "hydration",
  SLEEP: "sleep",
  BODY_WEIGHT: "body_weight",
  COACH: "coach",
  CUSTOM: "custom",
} as const;

export type ReminderType = (typeof ReminderTypes)[keyof typeof ReminderTypes];

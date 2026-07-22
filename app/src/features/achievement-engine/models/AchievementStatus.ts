/**
 * Lifecycle status of a detected achievement.
 */
export type AchievementStatus = "unlocked" | "duplicate" | "rejected";

export const AchievementStatuses = {
  UNLOCKED: "unlocked",
  DUPLICATE: "duplicate",
  REJECTED: "rejected",
} as const satisfies Record<string, AchievementStatus>;

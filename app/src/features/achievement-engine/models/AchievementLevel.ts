/**
 * Relative significance of an achievement.
 * Open string type for future levels without model changes.
 */
export type AchievementLevel = string;

export const AchievementLevels = {
  STANDARD: "standard",
  NOTABLE: "notable",
  MAJOR: "major",
} as const satisfies Record<string, AchievementLevel>;

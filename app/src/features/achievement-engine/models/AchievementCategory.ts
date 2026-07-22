/**
 * Achievement category identifier.
 * Open string type for extensibility (milestones, badges, goals, challenges, streaks)
 * without modifying this model.
 */
export type AchievementCategory = string;

export const AchievementCategories = {
  PERSONAL_RECORDS: "personal_records",
  /** Reserved — architecture support only; not implemented this sprint. */
  MILESTONES: "milestones",
  /** Reserved — architecture support only; not implemented this sprint. */
  BADGES: "badges",
  /** Reserved — architecture support only; not implemented this sprint. */
  GOALS: "goals",
  /** Reserved — architecture support only; not implemented this sprint. */
  CHALLENGES: "challenges",
  /** Reserved — architecture support only; not implemented this sprint. */
  STREAKS: "streaks",
} as const satisfies Record<string, AchievementCategory>;

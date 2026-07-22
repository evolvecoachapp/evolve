/**
 * Achievement type identifier.
 * Open string type so future types (milestones, badges, …) can be added
 * without changing this model — register new constants alongside Personal Record.
 */
export type AchievementType = string;

export const AchievementTypes = {
  PERSONAL_RECORD: "personal_record",
} as const satisfies Record<string, AchievementType>;

import type { Achievement } from "../models/Achievement";
import type { PersonalRecord } from "../models/PersonalRecord";
import { AchievementTypes } from "../models/AchievementType";
import { dedupeAchievements } from "./normalizeOutput";
import { sortAchievements } from "./sortAchievements";

/**
 * Aggregate detector outputs into a normalized, sorted achievement list.
 */
export function aggregateAchievements(
  achievements: readonly Achievement[],
): readonly Achievement[] {
  return sortAchievements(dedupeAchievements(achievements));
}

/**
 * Extract Personal Records from a mixed achievement list.
 */
export function extractPersonalRecords(
  achievements: readonly Achievement[],
): readonly PersonalRecord[] {
  return Object.freeze(
    achievements.filter(
      (a): a is PersonalRecord => a.type === AchievementTypes.PERSONAL_RECORD,
    ),
  );
}

/**
 * Count unlocked achievements by category.
 */
export function countByCategory(
  achievements: readonly Achievement[],
): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const achievement of achievements) {
    if (achievement.status !== "unlocked") {
      continue;
    }
    counts[achievement.category] = (counts[achievement.category] ?? 0) + 1;
  }
  return Object.freeze(counts);
}

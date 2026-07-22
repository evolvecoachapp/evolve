import type { Achievement } from "../models/Achievement";
import { AchievementCategories } from "../models/AchievementCategory";
import { AchievementTypes } from "../models/AchievementType";

const SUPPORTED_CATEGORIES = new Set<string>([
  AchievementCategories.PERSONAL_RECORDS,
]);

/**
 * Validate core achievement integrity (ids, types, timestamps).
 */
export function validateAchievementIntegrity(
  achievement: Achievement,
): readonly string[] {
  const issues: string[] = [];

  if (!achievement.id) {
    issues.push("achievement_missing_id");
  }
  if (!achievement.type) {
    issues.push("achievement_missing_type");
  }
  if (!achievement.category) {
    issues.push("achievement_missing_category");
  }
  if (!achievement.title) {
    issues.push("achievement_missing_title");
  }
  if (!achievement.unlockedAt) {
    issues.push("achievement_missing_unlocked_at");
  }
  if (!achievement.frozenAt) {
    issues.push("achievement_missing_frozen_at");
  }
  if (!achievement.context.sessionId || !achievement.context.runtimeId) {
    issues.push("achievement_context_incomplete");
  }
  if (
    achievement.type === AchievementTypes.PERSONAL_RECORD &&
    achievement.category !== AchievementCategories.PERSONAL_RECORDS
  ) {
    issues.push("personal_record_category_mismatch");
  }
  if (!SUPPORTED_CATEGORIES.has(achievement.category)) {
    // Reserved categories are architecture-only; flag as invalid for unlock path.
    issues.push(`invalid_category:${achievement.category}`);
  }

  return Object.freeze(issues);
}

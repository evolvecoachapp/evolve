import type { Achievement } from "../models/Achievement";
import type { PersonalRecord } from "../models/PersonalRecord";

/**
 * Normalize numeric evidence values (finite, non-negative rounding).
 */
export function normalizeValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 1000) / 1000;
}

/**
 * Deduplicate achievements by stable identity key.
 */
export function dedupeAchievements(
  achievements: readonly Achievement[],
): readonly Achievement[] {
  const seen = new Set<string>();
  const result: Achievement[] = [];
  for (const achievement of achievements) {
    const key = achievementIdentity(achievement);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(achievement);
  }
  return Object.freeze(result);
}

export function achievementIdentity(achievement: Achievement): string {
  const exerciseId =
    "personalRecordType" in achievement &&
    typeof (achievement as PersonalRecord).evidence.exerciseId === "string"
      ? (achievement as PersonalRecord).evidence.exerciseId
      : null;
  return [
    achievement.type,
    achievement.category,
    achievement.rule.id,
    exerciseId ?? "",
    achievement.evidence.metricKey,
  ].join("|");
}

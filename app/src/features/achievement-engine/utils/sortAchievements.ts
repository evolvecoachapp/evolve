import type { Achievement } from "../models/Achievement";

const LEVEL_RANK: Record<string, number> = {
  major: 3,
  notable: 2,
  standard: 1,
};

/**
 * Sort achievements: level desc, then unlockedAt asc, then id asc.
 */
export function sortAchievements(
  achievements: readonly Achievement[],
): readonly Achievement[] {
  return Object.freeze(
    [...achievements].sort((a, b) => {
      const levelDiff =
        (LEVEL_RANK[b.level] ?? 0) - (LEVEL_RANK[a.level] ?? 0);
      if (levelDiff !== 0) {
        return levelDiff;
      }
      const timeDiff = a.unlockedAt.localeCompare(b.unlockedAt);
      if (timeDiff !== 0) {
        return timeDiff;
      }
      return a.id.localeCompare(b.id);
    }),
  );
}

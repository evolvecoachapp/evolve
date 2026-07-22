import type { ExerciseDifficultyLevel } from "../../exercise-kb/models/ExerciseDifficulty";

const DIFFICULTY_RANK: Readonly<Record<ExerciseDifficultyLevel, number>> =
  Object.freeze({
    beginner: 0,
    intermediate: 1,
    advanced: 2,
    expert: 3,
  });

/**
 * Numeric rank for difficulty comparison (lower is easier).
 */
export function difficultyRank(level: ExerciseDifficultyLevel): number {
  return DIFFICULTY_RANK[level] ?? 1;
}

/**
 * True when candidate difficulty is within the optional max cap.
 */
export function isDifficultyWithinCap(
  level: ExerciseDifficultyLevel,
  maxDifficulty: ExerciseDifficultyLevel | null,
): boolean {
  if (!maxDifficulty) {
    return true;
  }
  return difficultyRank(level) <= difficultyRank(maxDifficulty);
}

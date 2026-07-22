/** Relative skill / readiness difficulty. */
export type ExerciseDifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export const EXERCISE_DIFFICULTY_LEVELS = Object.freeze([
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const satisfies readonly ExerciseDifficultyLevel[]);

/**
 * Structured difficulty metadata.
 */
export interface ExerciseDifficulty {
  readonly level: ExerciseDifficultyLevel;
  /** Skill demand score in [0, 10]. */
  readonly skillScore: number;
}

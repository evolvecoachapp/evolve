/** Structured experience level codes — never prose. */
export type ExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "elite";

export const EXPERIENCE_LEVELS: readonly ExperienceLevel[] = Object.freeze([
  "beginner",
  "intermediate",
  "advanced",
  "elite",
]);

/**
 * Athlete training experience snapshot.
 *
 * Used by Coach Intelligence when shaping recommendations.
 */
export interface TrainingExperience {
  readonly level: ExperienceLevel;
  /** ISO-8601 date when structured training started, if known. */
  readonly trainingStartedAt: string | null;
  /** Self-reported years of training; may be null when unknown. */
  readonly yearsTraining: number | null;
}

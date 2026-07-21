/** Overall progress band derived from PRs and plateaus. */
export type ProgressLevel =
  | "improving"
  | "maintaining"
  | "stagnating"
  | "regressing"
  | "unknown";

/**
 * Structured progress assessment — no natural language.
 */
export interface ProgressStatus {
  readonly level: ProgressLevel;
  /** Count of personal-record signals detected in the recent window. */
  readonly recentPRCount: number;
  /** Count of exercises flagged as plateaued. */
  readonly plateauExerciseCount: number;
}

/** High-level weekly/microcycle split structures. */
export type WorkoutSplitType =
  | "full_body"
  | "upper_lower"
  | "push_pull_legs"
  | "bro_split"
  | "hybrid"
  | "custom";

export const WORKOUT_SPLIT_TYPES = Object.freeze([
  "full_body",
  "upper_lower",
  "push_pull_legs",
  "bro_split",
  "hybrid",
  "custom",
] as const satisfies readonly WorkoutSplitType[]);

/**
 * Strategic split decision — frequency and cycle shape only.
 *
 * No exercise selection, volume, or progression.
 */
export interface WorkoutSplit {
  readonly type: WorkoutSplitType;
  /** Training sessions per week (excluding rest-only days). */
  readonly daysPerWeek: number;
  /** Microcycle length in calendar days. */
  readonly cycleLengthDays: number;
}

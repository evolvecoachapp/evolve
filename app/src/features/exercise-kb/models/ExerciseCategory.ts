/** Mechanical / programming category for an exercise. */
export type ExerciseCategoryCode =
  | "compound"
  | "isolation"
  | "olympic"
  | "plyometric"
  | "mobility"
  | "carry"
  | "other";

export const EXERCISE_CATEGORY_CODES = Object.freeze([
  "compound",
  "isolation",
  "olympic",
  "plyometric",
  "mobility",
  "carry",
  "other",
] as const satisfies readonly ExerciseCategoryCode[]);

/** Push / pull / legs classification used by selection engines. */
export type PushPullLegsCode = "push" | "pull" | "legs" | "other";

export const PUSH_PULL_LEGS_CODES = Object.freeze([
  "push",
  "pull",
  "legs",
  "other",
] as const satisfies readonly PushPullLegsCode[]);

/**
 * Structured category metadata.
 */
export interface ExerciseCategory {
  readonly code: ExerciseCategoryCode;
  readonly pushPullLegs: PushPullLegsCode;
  readonly isUnilateral: boolean;
  readonly isCompound: boolean;
}

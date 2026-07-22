/** Known catalog tags for exercise knowledge queries. */
export type ExerciseTagCode =
  | "squat_pattern"
  | "hinge_pattern"
  | "press"
  | "row"
  | "pull"
  | "lower_body"
  | "upper_body"
  | "posterior_chain"
  | "anterior_chain"
  | "bilateral"
  | "unilateral"
  | "machine"
  | "free_weight"
  | "bodyweight"
  | "beginner_friendly"
  | "advanced"
  | "axial_loading"
  | "low_axial"
  | "knee_friendly"
  | "shoulder_friendly"
  | "competition_lift"
  | "accessory"
  | "variation"
  | "progression"
  | "regression";

export const EXERCISE_TAG_CODES = Object.freeze([
  "squat_pattern",
  "hinge_pattern",
  "press",
  "row",
  "pull",
  "lower_body",
  "upper_body",
  "posterior_chain",
  "anterior_chain",
  "bilateral",
  "unilateral",
  "machine",
  "free_weight",
  "bodyweight",
  "beginner_friendly",
  "advanced",
  "axial_loading",
  "low_axial",
  "knee_friendly",
  "shoulder_friendly",
  "competition_lift",
  "accessory",
  "variation",
  "progression",
  "regression",
] as const satisfies readonly ExerciseTagCode[]);

/**
 * Tag entry attached to exercise knowledge.
 */
export interface ExerciseTag {
  readonly code: ExerciseTagCode;
}

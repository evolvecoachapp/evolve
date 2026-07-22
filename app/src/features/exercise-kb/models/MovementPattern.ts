/** Canonical movement pattern codes for exercise knowledge. */
export type MovementPatternCode =
  | "squat"
  | "hinge"
  | "lunge"
  | "horizontal_push"
  | "horizontal_pull"
  | "vertical_push"
  | "vertical_pull"
  | "carry"
  | "rotation"
  | "isolation"
  | "gait"
  | "other";

export const MOVEMENT_PATTERN_CODES = Object.freeze([
  "squat",
  "hinge",
  "lunge",
  "horizontal_push",
  "horizontal_pull",
  "vertical_push",
  "vertical_pull",
  "carry",
  "rotation",
  "isolation",
  "gait",
  "other",
] as const satisfies readonly MovementPatternCode[]);

/**
 * Structured movement pattern metadata.
 */
export interface MovementPattern {
  readonly code: MovementPatternCode;
}

/** Strategic focus areas — never exercise selections. */
export type TrainingFocusArea =
  | "upper_body"
  | "lower_body"
  | "push"
  | "pull"
  | "legs"
  | "full_body"
  | "posterior_chain"
  | "core"
  | "shoulders"
  | "arms"
  | "conditioning";

export const TRAINING_FOCUS_AREAS = Object.freeze([
  "upper_body",
  "lower_body",
  "push",
  "pull",
  "legs",
  "full_body",
  "posterior_chain",
  "core",
  "shoulders",
  "arms",
  "conditioning",
] as const satisfies readonly TrainingFocusArea[]);

/**
 * Strategic training focus for a blueprint, block, or session day.
 */
export interface TrainingFocus {
  readonly primary: TrainingFocusArea;
  readonly secondary: TrainingFocusArea | null;
}

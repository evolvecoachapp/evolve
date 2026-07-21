/** Preferred training split codes — never prose. */
export type PreferredSplit =
  | "full_body"
  | "upper_lower"
  | "push_pull_legs"
  | "bro_split"
  | "custom";

export const PREFERRED_SPLITS: readonly PreferredSplit[] = Object.freeze([
  "full_body",
  "upper_lower",
  "push_pull_legs",
  "bro_split",
  "custom",
]);

export type IntensityBias = "low" | "moderate" | "high";

export const INTENSITY_BIASES: readonly IntensityBias[] = Object.freeze([
  "low",
  "moderate",
  "high",
]);

/**
 * Soft training preferences that influence coaching context.
 *
 * Not program prescriptions — those stay in the Training Engine.
 */
export interface TrainingPreference {
  readonly preferredSplit: PreferredSplit | null;
  readonly prefersCompoundLifts: boolean;
  readonly intensityBias: IntensityBias;
}

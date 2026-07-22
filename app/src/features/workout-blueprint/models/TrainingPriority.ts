/** Strategic training priority codes — never prose. */
export type TrainingPriorityCode =
  | "strength"
  | "hypertrophy"
  | "endurance"
  | "power"
  | "recovery"
  | "technique"
  | "general_fitness";

export const TRAINING_PRIORITY_CODES = Object.freeze([
  "strength",
  "hypertrophy",
  "endurance",
  "power",
  "recovery",
  "technique",
  "general_fitness",
] as const satisfies readonly TrainingPriorityCode[]);

/**
 * High-level training priority decided by the Blueprint Generator.
 *
 * Strategy only — never exercises, sets, reps, or intensity.
 */
export interface TrainingPriority {
  readonly primary: TrainingPriorityCode;
  readonly secondary: TrainingPriorityCode | null;
}

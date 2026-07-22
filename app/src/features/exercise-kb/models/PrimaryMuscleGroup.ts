/** Primary muscle group codes targeted by an exercise. */
export type PrimaryMuscleGroupCode =
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "chest"
  | "upper_back"
  | "lats"
  | "traps"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "core"
  | "lower_back"
  | "adductors"
  | "abductors";

export const PRIMARY_MUSCLE_GROUP_CODES = Object.freeze([
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "chest",
  "upper_back",
  "lats",
  "traps",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "core",
  "lower_back",
  "adductors",
  "abductors",
] as const satisfies readonly PrimaryMuscleGroupCode[]);

/**
 * Primary muscle group entry on an ExerciseDefinition.
 */
export interface PrimaryMuscleGroup {
  readonly code: PrimaryMuscleGroupCode;
}

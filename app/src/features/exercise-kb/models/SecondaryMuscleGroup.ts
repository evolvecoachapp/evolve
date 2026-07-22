import type { PrimaryMuscleGroupCode } from "./PrimaryMuscleGroup";
import { PRIMARY_MUSCLE_GROUP_CODES } from "./PrimaryMuscleGroup";

/** Secondary muscle groups reuse the same code space as primary. */
export type SecondaryMuscleGroupCode = PrimaryMuscleGroupCode;

export const SECONDARY_MUSCLE_GROUP_CODES = PRIMARY_MUSCLE_GROUP_CODES;

/**
 * Secondary / assisting muscle group entry on an ExerciseDefinition.
 */
export interface SecondaryMuscleGroup {
  readonly code: SecondaryMuscleGroupCode;
}

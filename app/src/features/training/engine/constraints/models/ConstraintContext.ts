import type { EquipmentType } from "../../../enums/EquipmentType";
import type { MuscleGroup } from "../../../enums/MuscleGroup";
import type { ExerciseDefinition } from "../../../models/ExerciseDefinition";
import type { ExerciseId } from "../../../types/ids";

/**
 * Everything a `Constraint` needs to evaluate a single exercise candidate:
 * the candidate itself, plus the athlete's equipment, exclusions, and
 * target muscles for the current planning pass. Deliberately read-only and
 * free of any planner- or goal-specific fields, so the same context shape
 * serves every current and future constraint without those constraints, or
 * the planners that use them, needing to know about each other.
 */
export interface ConstraintContext {
  readonly exercise: ExerciseDefinition;
  readonly availableEquipment: readonly EquipmentType[];
  readonly excludedExerciseIds: readonly ExerciseId[];
  readonly targetMuscleGroups: readonly MuscleGroup[];
}

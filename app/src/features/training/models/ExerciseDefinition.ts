import type { EquipmentType } from "../enums/EquipmentType";
import type { ExerciseCategory } from "../enums/ExerciseCategory";
import type { MovementPattern } from "../enums/MovementPattern";
import type { MuscleGroup } from "../enums/MuscleGroup";
import type { ExerciseId } from "../types/ids";

/**
 * A single catalogue entry describing a movement, independent of any
 * program, day, or set prescription. The catalogue is the only place
 * exercise metadata (muscles, equipment, movement pattern) lives; every
 * other model references an exercise by `ExerciseId` instead of embedding
 * it, so the catalogue can evolve without touching program structure.
 */
export interface ExerciseDefinition {
  readonly id: ExerciseId;
  readonly name: string;
  readonly category: ExerciseCategory;
  readonly movementPattern: MovementPattern;
  readonly primaryMuscles: readonly MuscleGroup[];
  readonly secondaryMuscles: readonly MuscleGroup[];
  readonly equipment: readonly EquipmentType[];
  readonly isUnilateral: boolean;
  readonly isBodyweight: boolean;
  readonly notes: string | null;
}

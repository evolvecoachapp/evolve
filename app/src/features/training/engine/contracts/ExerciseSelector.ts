import type { EquipmentType } from "../../enums/EquipmentType";
import type { ExerciseCategory } from "../../enums/ExerciseCategory";
import type { ExperienceLevel } from "../../enums/ExperienceLevel";
import type { MovementPattern } from "../../enums/MovementPattern";
import type { MuscleGroup } from "../../enums/MuscleGroup";
import type { TrainingGoal } from "../../enums/TrainingGoal";
import type { ExerciseDefinition } from "../../models/ExerciseDefinition";
import type { ExerciseId } from "../../types/ids";

/**
 * Constraints an `ExerciseSelector` must satisfy when choosing exercises
 * for a single training day or slot. Expressed generically in terms of
 * goal, muscles, movement patterns, and equipment so the same contract
 * serves bodybuilding, powerlifting, powerbuilding, and hybrid programming
 * alike, without favoring any one methodology.
 */
export interface ExerciseSelectionCriteria {
  readonly goal: TrainingGoal;
  readonly experienceLevel: ExperienceLevel;
  readonly targetMuscleGroups: readonly MuscleGroup[];
  readonly requiredMovementPatterns: readonly MovementPattern[];
  readonly preferredCategories: readonly ExerciseCategory[];
  readonly availableEquipment: readonly EquipmentType[];
  readonly excludedExerciseIds: readonly ExerciseId[];
  readonly minExercises: number;
  readonly maxExercises: number;
}

/**
 * A single exercise chosen by an `ExerciseSelector`, ordered within its
 * training day and annotated with the muscles it was chosen to target.
 * Deliberately omits sets, reps, and intensity — that is the responsibility
 * of `VolumePlanner`, keeping selection and volume concerns independent.
 */
export interface SelectedExercise {
  readonly exerciseId: ExerciseId;
  readonly order: number;
  readonly targetedMuscles: readonly MuscleGroup[];
}

/** Outcome of an exercise selection pass for one training day or slot. */
export interface ExerciseSelectionResult {
  readonly selections: readonly SelectedExercise[];
}

/**
 * Chooses exercises from a catalogue to satisfy a set of selection
 * criteria. Contract only: implementations decide *how* candidates are
 * ranked or filtered; this interface only fixes the shape of the inputs
 * and outputs so selection strategies can be swapped freely.
 */
export interface ExerciseSelector {
  selectExercises(
    catalogue: readonly ExerciseDefinition[],
    criteria: ExerciseSelectionCriteria,
  ): ExerciseSelectionResult;
}

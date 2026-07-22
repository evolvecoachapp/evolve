import type { AllowedGoalCode } from "../../exercise-kb/models/ExerciseDefinition";
import type { EquipmentCode } from "../../exercise-kb/models/EquipmentRequirement";
import type { ExerciseDifficultyLevel } from "../../exercise-kb/models/ExerciseDifficulty";
import type { MovementPatternCode } from "../../exercise-kb/models/MovementPattern";
import type { SessionGoalCode } from "../../workout-blueprint/models/SessionGoal";
import type { TrainingFocus } from "../../workout-blueprint/models/TrainingFocus";
import type { TrainingPriority } from "../../workout-blueprint/models/TrainingPriority";
import type { SelectionConstraint } from "./SelectionConstraint";

/**
 * Immutable derived context used by strategies and selectors.
 * Built from a WorkoutBlueprint day — never contains sets/reps/RPE.
 */
export interface SelectionContext {
  readonly blueprintId: string;
  readonly dayId: string;
  readonly dayIndex: number;
  readonly focus: TrainingFocus;
  readonly sessionGoal: SessionGoalCode;
  readonly priority: TrainingPriority;
  readonly requiredMovementPatterns: readonly MovementPatternCode[];
  readonly secondaryMovementPatterns: readonly MovementPatternCode[];
  /** null means all equipment is considered available. */
  readonly availableEquipment: readonly EquipmentCode[] | null;
  /** null means no difficulty cap. */
  readonly maxDifficulty: ExerciseDifficultyLevel | null;
  readonly constraints: readonly SelectionConstraint[];
  readonly excludedExerciseIds: readonly string[];
  readonly maxCandidatesPerRole: number;
  readonly goalCodes: readonly AllowedGoalCode[];
}

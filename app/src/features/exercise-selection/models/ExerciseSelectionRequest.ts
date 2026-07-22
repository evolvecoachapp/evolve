import type { EquipmentCode } from "../../exercise-kb/models/EquipmentRequirement";
import type { ExerciseDifficultyLevel } from "../../exercise-kb/models/ExerciseDifficulty";
import type { WorkoutBlueprint } from "../../workout-blueprint/models/WorkoutBlueprint";

/**
 * Input to the Exercise Selection Engine.
 *
 * Consumes a Workout Blueprint plus optional athlete/equipment overrides.
 * Never includes sets, reps, RPE, progression, or fatigue programming.
 */
export interface ExerciseSelectionRequest {
  readonly blueprint: WorkoutBlueprint;
  /** Optional day to select for; defaults to the first non-rest day. */
  readonly dayId?: string;
  readonly availableEquipment?: readonly EquipmentCode[];
  readonly maxDifficulty?: ExerciseDifficultyLevel;
  readonly excludedExerciseIds?: readonly string[];
  /** Cap per role group; defaults to engine constant. */
  readonly maxCandidatesPerRole?: number;
  /** When false, explanations array is empty. Defaults to true. */
  readonly includeExplanations?: boolean;
}

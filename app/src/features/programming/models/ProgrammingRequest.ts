import type { WorkoutBlueprint } from "../../workout-blueprint/models/WorkoutBlueprint";
import type { ExerciseSelectionResult } from "../../exercise-selection/models/ExerciseSelectionResult";

/**
 * Input to the Programming Engine.
 * Consumes a prior Exercise Selection result and its blueprint.
 */
export interface ProgrammingRequest {
  readonly blueprint: WorkoutBlueprint;
  readonly selection: ExerciseSelectionResult;
  /** Optional override; defaults to selection.context.dayId. */
  readonly dayId?: string;
  readonly includeExplanations?: boolean;
}

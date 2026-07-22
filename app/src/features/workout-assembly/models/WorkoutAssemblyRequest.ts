import type { ExerciseSelectionResult } from "../../exercise-selection/models/ExerciseSelectionResult";
import type { ProgrammingResult } from "../../programming/models/ProgrammingResult";
import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import type { TrainingAdaptationResult } from "../../training-adaptation/models/TrainingAdaptationResult";
import type { WorkoutBlueprint } from "../../workout-blueprint/models/WorkoutBlueprint";

/**
 * Input to the Workout Assembly Engine.
 * Consumes outputs from all prior pipeline stages.
 */
export interface WorkoutAssemblyRequest {
  readonly blueprint: WorkoutBlueprint;
  readonly selection: ExerciseSelectionResult;
  readonly programming: ProgrammingResult;
  readonly progression: ProgressionPlan;
  readonly adaptation: TrainingAdaptationResult;
  /** Week to assemble from the progression plan (1-based). Defaults to window start. */
  readonly weekNumber?: number;
  readonly includeExplanations?: boolean;
}

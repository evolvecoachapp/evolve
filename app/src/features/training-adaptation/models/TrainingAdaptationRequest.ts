import type { WorkoutBlueprint } from "../../workout-blueprint/models/WorkoutBlueprint";
import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";

/**
 * Input to the Training Adaptation Engine.
 * Consumes a prior Progression plan and its blueprint.
 */
export interface TrainingAdaptationRequest {
  readonly blueprint: WorkoutBlueprint;
  readonly progression: ProgressionPlan;
  readonly includeExplanations?: boolean;
}

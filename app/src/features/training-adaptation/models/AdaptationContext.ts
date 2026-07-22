import type { SessionGoalCode } from "../../workout-blueprint/models/SessionGoal";
import type { TrainingFocus } from "../../workout-blueprint/models/TrainingFocus";
import type { TrainingPriority } from "../../workout-blueprint/models/TrainingPriority";
import type { TrainingConstraint } from "./TrainingConstraint";

/**
 * Immutable derived context used by assessments and adaptation strategies.
 * Built from WorkoutBlueprint + ProgressionPlan.
 */
export interface AdaptationContext {
  readonly blueprintId: string;
  readonly progressionRequestId: string;
  readonly dayId: string;
  readonly dayIndex: number;
  readonly focus: TrainingFocus;
  readonly sessionGoal: SessionGoalCode;
  readonly priority: TrainingPriority;
  readonly weekCount: number;
  readonly prescriptionCount: number;
  readonly weeklyFrequency: number;
  readonly constraints: readonly TrainingConstraint[];
  readonly progressionScoreTotal: number;
  readonly averageVolumeSets: number;
  readonly peakIntensityValue: number;
  readonly includeExplanations: boolean;
}

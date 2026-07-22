import type { SessionGoalCode } from "../../workout-blueprint/models/SessionGoal";
import type { TrainingFocus } from "../../workout-blueprint/models/TrainingFocus";
import type { TrainingPriority } from "../../workout-blueprint/models/TrainingPriority";
import type { ProgressionConstraint } from "./ProgressionConstraint";
import type { ProgressionWindow } from "./ProgressionWindow";

/**
 * Immutable derived context used by progression strategies.
 * Built from WorkoutBlueprint + ProgrammingResult.
 */
export interface ProgressionContext {
  readonly blueprintId: string;
  readonly programmingRequestId: string;
  readonly dayId: string;
  readonly dayIndex: number;
  readonly focus: TrainingFocus;
  readonly sessionGoal: SessionGoalCode;
  readonly priority: TrainingPriority;
  readonly window: ProgressionWindow;
  readonly prescriptionCount: number;
  readonly weeklyFrequency: number;
  readonly constraints: readonly ProgressionConstraint[];
  readonly includeExplanations: boolean;
}

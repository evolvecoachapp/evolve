import type { AllowedGoalCode } from "../../exercise-kb/models/ExerciseDefinition";
import type { SessionGoalCode } from "../../workout-blueprint/models/SessionGoal";
import type { TrainingFocus } from "../../workout-blueprint/models/TrainingFocus";
import type { TrainingPriority } from "../../workout-blueprint/models/TrainingPriority";
import type { ProgrammingConstraint } from "./ProgrammingConstraint";

/**
 * Immutable derived context used by programming strategies.
 * Built from WorkoutBlueprint + ExerciseSelectionResult.
 */
export interface ProgrammingContext {
  readonly blueprintId: string;
  readonly selectionRequestId: string;
  readonly dayId: string;
  readonly dayIndex: number;
  readonly focus: TrainingFocus;
  readonly sessionGoal: SessionGoalCode;
  readonly priority: TrainingPriority;
  readonly goalCodes: readonly AllowedGoalCode[];
  readonly constraints: readonly ProgrammingConstraint[];
  readonly candidateCount: number;
  readonly includeExplanations: boolean;
}

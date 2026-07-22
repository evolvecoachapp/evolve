import type { SessionGoalCode } from "../../workout-blueprint/models/SessionGoal";
import type { TrainingFocus } from "../../workout-blueprint/models/TrainingFocus";
import type { TrainingPriority } from "../../workout-blueprint/models/TrainingPriority";
import type { WorkoutAssemblyConstraint } from "./WorkoutAssemblyConstraint";

/**
 * Immutable derived context used by the Workout Assembly Engine.
 * Built from Blueprint + Selection + Programming + Progression + Adaptation.
 */
export interface WorkoutAssemblyContext {
  readonly blueprintId: string;
  readonly dayId: string;
  readonly dayIndex: number;
  readonly weekNumber: number;
  readonly selectionRequestId: string;
  readonly programmingRequestId: string;
  readonly progressionRequestId: string;
  readonly adaptationRequestId: string;
  readonly focus: TrainingFocus;
  readonly sessionGoal: SessionGoalCode;
  readonly priority: TrainingPriority;
  readonly prescriptionCount: number;
  readonly recommendationCount: number;
  readonly readinessScore: number;
  readonly weeklyFrequency: number;
  readonly constraints: readonly WorkoutAssemblyConstraint[];
  readonly includeExplanations: boolean;
}

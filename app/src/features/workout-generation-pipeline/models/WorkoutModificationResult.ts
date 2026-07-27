import type { WorkoutAgentResult } from "../../workout-agent/models/WorkoutAgentResult";
import type { WorkoutModificationChange } from "./WorkoutModificationChange";
import type { WorkoutModificationKind } from "./WorkoutModificationKind";
import type { WorkoutModificationRequest } from "./WorkoutModificationRequest";
import type { WorkoutPlan } from "./WorkoutPlan";
import type { WorkoutPlanValidation } from "./WorkoutPlanValidation";

export const WorkoutModificationStages = {
  REQUEST: "modification_request",
  WORKOUT_AGENT: "workout_agent",
  APPLY: "apply_modification",
  VALIDATION: "validation",
  PLAN: "updated_plan",
} as const;

export type WorkoutModificationStage =
  (typeof WorkoutModificationStages)[keyof typeof WorkoutModificationStages];

export interface WorkoutModificationStageTrace {
  readonly stage: WorkoutModificationStage;
  readonly success: boolean;
  readonly summary: string;
  readonly completedAt: string;
}

/**
 * Immutable result of Adaptive Workout Modification.
 */
export interface WorkoutModificationResult {
  readonly id: string;
  readonly success: boolean;
  readonly kind: WorkoutModificationKind;
  readonly request: WorkoutModificationRequest;
  readonly previousPlan: WorkoutPlan;
  readonly plan: WorkoutPlan | null;
  readonly changes: readonly WorkoutModificationChange[];
  readonly preserved: readonly string[];
  readonly validation: WorkoutPlanValidation;
  readonly workoutAgent: WorkoutAgentResult | null;
  readonly explanation: string;
  readonly progressionImpact: string;
  readonly recoveryImpact: string;
  readonly trace: readonly WorkoutModificationStageTrace[];
  readonly errors: readonly string[];
  readonly message: string;
  readonly startedAt: string;
  readonly completedAt: string;
}

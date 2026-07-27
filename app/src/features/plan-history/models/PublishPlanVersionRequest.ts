import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { PlanChangeReason } from "./PlanChangeReason";
import type { PlanType } from "./PlanType";

/**
 * Request to append a brand-new immutable version to plan history.
 */
export interface PublishPlanVersionRequest {
  readonly id: string;
  readonly lineageId: string;
  readonly planType: PlanType;
  readonly athleteId: string;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly changeReason: PlanChangeReason;
  readonly changeSummary: string;
  readonly workoutPlan: WorkoutPlan | null;
  readonly nutritionPlan: NutritionPlan | null;
  /** Test / defensive hook — marks snapshot corrupt without mutating payload. */
  readonly markCorrupted?: boolean;
  readonly createdAt: string;
}

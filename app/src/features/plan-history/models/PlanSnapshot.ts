import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { PlanVersion } from "./PlanVersion";

/**
 * Immutable snapshot of a plan at a published version.
 * Never mutate after publish — restore clones into a new version.
 */
export interface PlanSnapshot {
  readonly id: string;
  readonly version: PlanVersion;
  readonly workoutPlan: WorkoutPlan | null;
  readonly nutritionPlan: NutritionPlan | null;
  /** When true, integrity validation must reject restore. */
  readonly corrupted: boolean;
}

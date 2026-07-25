import type { AdaptationDecision } from "./AdaptationDecision";
import type { AdaptationPackage } from "./AdaptationPackage";
import type { GoalProgressInput } from "./GoalProgressInput";
import type { NutritionAdaptationInput } from "./NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "./RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "./WorkoutAdaptationInput";

/**
 * Compact structured output handoff.
 */
export interface AdaptationOutput {
  readonly decisions: readonly AdaptationDecision[];
  readonly package: AdaptationPackage | null;
  readonly workoutAdaptationInput: WorkoutAdaptationInput | null;
  readonly nutritionAdaptationInput: NutritionAdaptationInput | null;
  readonly recoveryAdaptationInput: RecoveryAdaptationInput | null;
  readonly goalProgressInput: GoalProgressInput | null;
}

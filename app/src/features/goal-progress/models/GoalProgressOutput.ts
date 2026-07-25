import type { ContinuousAdaptationInput } from "./ContinuousAdaptationInput";
import type { GoalPackage } from "./GoalPackage";
import type { GoalProgress } from "./GoalProgress";

/**
 * Compact structured output handoff.
 */
export interface GoalProgressOutput {
  readonly decisions: readonly GoalProgress[];
  readonly package: GoalPackage | null;
  readonly continuousAdaptationInput: ContinuousAdaptationInput | null;
}

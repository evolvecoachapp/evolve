import type { RecoveryPlan } from "./RecoveryPlan";
import type { RecoveryPlanningContext } from "./RecoveryPlanningContext";

export interface RecoveryPlanningResult {
  readonly planningContext: RecoveryPlanningContext;
  readonly plan: RecoveryPlan;
  readonly plannerIds: readonly string[];
  readonly notes: readonly string[];
}

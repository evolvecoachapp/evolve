import type { WorkoutPlanProposal } from "./WorkoutPlanProposal";
import type { WorkoutPlanningContext } from "./WorkoutPlanningContext";

/**
 * Aggregate planning output from planners.
 */
export interface WorkoutPlanningResult {
  readonly id: string;
  readonly planningContext: WorkoutPlanningContext;
  readonly proposal: WorkoutPlanProposal;
  readonly plannerIds: readonly string[];
  readonly success: boolean;
  readonly message: string | null;
  readonly frozenAt: string;
}

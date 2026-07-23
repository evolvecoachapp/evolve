import type { CoordinationPlan } from "../models/CoordinationPlan";
import { selectExecutionSteps } from "../selectors/ExecutionSelector";

/**
 * Planning only — returns ordered invoke steps, never executes.
 */
export class ExecutionPlanner {
  plan(coordination: CoordinationPlan) {
    return selectExecutionSteps(coordination);
  }
}

export function createExecutionPlanner(): ExecutionPlanner {
  return new ExecutionPlanner();
}

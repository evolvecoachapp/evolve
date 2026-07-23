import type { RoutingStep } from "../models/RoutingStep";
import { sortStepsDeterministic } from "../utils/sortHelpers";

/**
 * Selects steps in deterministic execution order.
 */
export class ExecutionSelector {
  select(steps: readonly RoutingStep[]): readonly RoutingStep[] {
    return sortStepsDeterministic(steps);
  }

  selectIds(steps: readonly RoutingStep[]): readonly string[] {
    return Object.freeze(this.select(steps).map((step) => step.id));
  }
}

export function createExecutionSelector(): ExecutionSelector {
  return new ExecutionSelector();
}

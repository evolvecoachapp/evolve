import type { ActionPlan } from "../models/ActionPlan";
import type { ActionStep } from "../models/ActionStep";
import { ActionStatuses } from "../models/ActionStatus";
import { topologicalStepOrder } from "../utils/dependencyHelpers";

/**
 * Execution policy — planning-time readiness rules only.
 * Does not execute domain tools.
 */
export interface ExecutionPolicy {
  readonly id: string;
  canPrepare(plan: ActionPlan): boolean;
  readySteps(plan: ActionPlan): readonly ActionStep[];
  orderedStepIds(plan: ActionPlan): readonly string[];
}

export class DefaultExecutionPolicy implements ExecutionPolicy {
  readonly id = "policy:execution:default";

  canPrepare(plan: ActionPlan): boolean {
    return (
      plan.id.trim().length > 0 &&
      plan.status !== ActionStatuses.CANCELLED &&
      plan.steps.length >= 0
    );
  }

  readySteps(plan: ActionPlan): readonly ActionStep[] {
    return Object.freeze(
      plan.steps.filter(
        (s) =>
          s.status === ActionStatuses.PLANNED ||
          s.status === ActionStatuses.READY,
      ),
    );
  }

  orderedStepIds(plan: ActionPlan): readonly string[] {
    return topologicalStepOrder(plan.steps);
  }
}

import type { DecisionPlan } from "../models/DecisionPlan";
import { DecisionStepStatuses } from "../models/DecisionStep";
import { freezePlan } from "../utils/FreezeDecisionState";

/**
 * Execution planner — marks ready/blocked status only (never executes).
 */
export function planExecution(input: {
  readonly plan: DecisionPlan;
  readonly blockedDecisionIds: readonly string[];
}): DecisionPlan {
  const blocked = new Set(input.blockedDecisionIds);
  return freezePlan({
    ...input.plan,
    steps: Object.freeze(
      input.plan.steps.map((step) =>
        Object.freeze({
          ...step,
          status: blocked.has(step.decisionId)
            ? DecisionStepStatuses.BLOCKED
            : DecisionStepStatuses.READY,
          dependsOn: Object.freeze([...step.dependsOn]),
          metadata: step.metadata,
        }),
      ),
    ),
  });
}

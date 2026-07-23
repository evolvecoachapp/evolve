import type { ActionPlan } from "../models/ActionPlan";
import type { ActionSummary } from "../models/ActionSummary";
import { ActionStatuses } from "../models/ActionStatus";
import { freezeSummary } from "./freezeActionPlan";

/**
 * Build an immutable ActionSummary from an ActionPlan.
 */
export function summarizeActionPlan(plan: ActionPlan): ActionSummary {
  const readyStepCount = plan.steps.filter(
    (s) =>
      s.status === ActionStatuses.READY || s.status === ActionStatuses.PLANNED,
  ).length;
  const blockedStepCount = plan.steps.filter(
    (s) => s.status === ActionStatuses.BLOCKED,
  ).length;

  return freezeSummary({
    planId: plan.id,
    sourceResponseId: plan.sourceResponseId,
    intent: plan.intent,
    stepCount: plan.steps.length,
    dependencyCount: plan.dependencies.length,
    priority: plan.priority,
    status: plan.status,
    readyStepCount,
    blockedStepCount,
    complete:
      plan.id.trim().length > 0 &&
      plan.sourceResponseId.trim().length > 0 &&
      plan.frozenAt.trim().length > 0,
  });
}

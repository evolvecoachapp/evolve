import type { ActionPlan } from "../models/ActionPlan";
import type { ActionExecutor } from "./ActionExecutor";
import {
  createExecutionContext,
  type ExecutionContext,
} from "./ExecutionContext";
import {
  createExecutionRequest,
  type ExecutionRequest,
} from "./ExecutionRequest";
import {
  DEFAULT_EXECUTION_STRATEGY,
  type ExecutionStrategy,
} from "./ExecutionStrategy";
import type { ActionExecutionPlan } from "../models/ActionExecutionPlan";
import { freezeExecutionPlan } from "../utils/freezeActionPlan";
import { topologicalStepOrder } from "../utils/dependencyHelpers";

/**
 * Contract-only executor that prepares ExecutionRequest objects.
 * Never runs domain tools.
 */
export class PlanningActionExecutor implements ActionExecutor {
  readonly id = "executor:planning";

  constructor(
    private readonly strategy: ExecutionStrategy = DEFAULT_EXECUTION_STRATEGY,
  ) {}

  prepare(plan: ActionPlan, context: ExecutionContext): ExecutionRequest {
    const orderedStepIds = topologicalStepOrder(plan.steps);
    const byId = new Map(plan.steps.map((s) => [s.id, s]));
    const orderedSteps = Object.freeze(
      orderedStepIds
        .map((id) => byId.get(id))
        .filter((s): s is NonNullable<typeof s> => !!s),
    );

    const executionPlan: ActionExecutionPlan = freezeExecutionPlan({
      id: `execplan:${plan.id}`,
      planId: plan.id,
      orderedStepIds,
      steps: orderedSteps,
      estimatedStepCount: orderedSteps.length,
      createdAt: context.requestedAt,
      sourcePlan: plan,
    });

    return createExecutionRequest({
      id: `execreq:${plan.id}`,
      executionPlan,
      context: createExecutionContext(context),
      strategy: this.strategy,
      createdAt: context.requestedAt,
    });
  }
}

import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionStep } from "../models/ToolExecutionStep";
import type { OrderingPolicy } from "../policies/OrderingPolicy";
import { DefaultOrderingPolicy } from "../policies/OrderingPolicy";
import { orderedStepsFromPlan } from "../utils/pipelineHelpers";

/**
 * Schedules execution order. Orchestration only.
 */
export class ExecutionScheduler {
  readonly id = "runtime:scheduler";

  constructor(
    private readonly orderingPolicy: OrderingPolicy = new DefaultOrderingPolicy(),
  ) {}

  schedule(plan: ToolExecutionPlan): readonly ToolExecutionStep[] {
    const orderedIds = this.orderingPolicy.orderStepIds(plan);
    const byId = new Map(plan.steps.map((s) => [s.id, s]));
    return Object.freeze(
      orderedIds
        .map((id) => byId.get(id))
        .filter((s): s is ToolExecutionStep => s != null),
    );
  }

  nextReady(
    plan: ToolExecutionPlan,
    completedIds: ReadonlySet<string>,
  ): ToolExecutionStep | null {
    for (const step of orderedStepsFromPlan(plan)) {
      if (completedIds.has(step.id)) continue;
      const depsMet = step.dependsOn.every((d) => completedIds.has(d));
      if (depsMet) return step;
    }
    return null;
  }
}

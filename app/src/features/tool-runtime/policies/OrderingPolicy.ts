import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import { topologicalStepOrder } from "../utils/dependencyHelpers";

export interface OrderingPolicy {
  readonly id: string;
  orderStepIds(plan: ToolExecutionPlan): readonly string[];
}

export class DefaultOrderingPolicy implements OrderingPolicy {
  readonly id = "policy:ordering:default";

  orderStepIds(plan: ToolExecutionPlan): readonly string[] {
    return topologicalStepOrder(plan.steps);
  }
}

import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import { hasCircularDependencies } from "../utils/dependencyHelpers";

export interface SafetyPolicy {
  readonly id: string;
  isSafe(plan: ToolExecutionPlan): boolean;
  safetyViolations(plan: ToolExecutionPlan): readonly string[];
}

export class DefaultSafetyPolicy implements SafetyPolicy {
  readonly id = "policy:safety:default";

  isSafe(plan: ToolExecutionPlan): boolean {
    return this.safetyViolations(plan).length === 0;
  }

  safetyViolations(plan: ToolExecutionPlan): readonly string[] {
    const violations: string[] = [];
    if (!plan.id) violations.push("missing_plan_id");
    if (hasCircularDependencies(plan.steps)) {
      violations.push("circular_dependency");
    }
    for (const step of plan.steps) {
      if (!step.id) violations.push("missing_step_id");
      if (!step.actionStepId) violations.push(`step:${step.id}:missing_action`);
    }
    return Object.freeze(violations);
  }
}

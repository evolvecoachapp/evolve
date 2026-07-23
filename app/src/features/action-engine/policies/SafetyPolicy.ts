import type { ActionConstraint } from "../models/ActionConstraint";
import { ActionConstraintKinds } from "../models/ActionConstraint";
import type { ActionPlan } from "../models/ActionPlan";

/**
 * Safety policy — structural safety constraints only (no domain logic).
 */
export interface SafetyPolicy {
  readonly id: string;
  isSafe(plan: ActionPlan): boolean;
  safetyViolations(plan: ActionPlan): readonly string[];
}

export class DefaultSafetyPolicy implements SafetyPolicy {
  readonly id = "policy:safety:default";

  isSafe(plan: ActionPlan): boolean {
    return this.safetyViolations(plan).length === 0;
  }

  safetyViolations(plan: ActionPlan): readonly string[] {
    const violations: string[] = [];
    const maxSteps = this.readMaxSteps(plan.constraints);
    if (maxSteps !== null && plan.steps.length > maxSteps) {
      violations.push(`step_count_exceeds_max:${maxSteps}`);
    }

    for (const step of plan.steps) {
      if (this.requiresTarget(step.constraints) && !step.target) {
        violations.push(`missing_required_target:${step.id}`);
      }
    }

    return Object.freeze(violations);
  }

  private readMaxSteps(
    constraints: readonly ActionConstraint[],
  ): number | null {
    const found = constraints.find(
      (c) => c.kind === ActionConstraintKinds.MAX_STEPS,
    );
    return typeof found?.value === "number" ? found.value : null;
  }

  private requiresTarget(
    constraints: readonly ActionConstraint[],
  ): boolean {
    return constraints.some(
      (c) => c.kind === ActionConstraintKinds.REQUIRES_TARGET,
    );
  }
}

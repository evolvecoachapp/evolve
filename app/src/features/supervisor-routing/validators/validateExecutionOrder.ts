import type { RoutingStep } from "../models/RoutingStep";
import {
  RoutingValidationCodes,
  type RoutingValidation,
  type RoutingValidationIssue,
} from "../models/RoutingValidation";

export function validateExecutionOrder(
  steps: readonly RoutingStep[],
): RoutingValidation {
  const issues: RoutingValidationIssue[] = [];
  const byId = new Map(steps.map((step) => [step.id, step]));
  const sorted = [...steps].sort((a, b) => a.orderIndex - b.orderIndex);

  for (let i = 0; i < sorted.length; i += 1) {
    if (sorted[i].orderIndex !== i) {
      issues.push({
        code: RoutingValidationCodes.INVALID_EXECUTION_ORDER,
        message: "Execution order indexes must be contiguous from 0.",
        path: "steps.orderIndex",
      });
      break;
    }
  }

  for (const step of steps) {
    for (const depId of step.dependsOnStepIds) {
      const dep = byId.get(depId);
      if (!dep) {
        issues.push({
          code: RoutingValidationCodes.INVALID_EXECUTION_ORDER,
          message: `Step ${step.id} depends on unknown step ${depId}`,
          path: "steps.dependsOnStepIds",
        });
        continue;
      }
      if (dep.orderIndex >= step.orderIndex) {
        issues.push({
          code: RoutingValidationCodes.INVALID_EXECUTION_ORDER,
          message: `Step ${step.id} must follow dependency ${depId}`,
          path: "steps.orderIndex",
        });
      }
    }
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues.map((issue) => Object.freeze(issue))),
  });
}

import type { ActionPlan } from "../models/ActionPlan";
import type { ActionValidationIssue } from "../models/ActionValidation";
import { ActionValidationCodes } from "../models/ActionValidation";
import {
  hasCircularDependencies,
  stepsMissingDependencies,
} from "../utils/dependencyHelpers";
import { freezeValidationIssue } from "../utils/freezeActionPlan";

function issue(
  code: ActionValidationIssue["code"],
  message: string,
  path: string | null = null,
): ActionValidationIssue {
  return freezeValidationIssue({ code, message, path });
}

/**
 * Validate step dependencies and dependency edges.
 */
export function validateDependencies(
  plan: ActionPlan,
): readonly ActionValidationIssue[] {
  const issues: ActionValidationIssue[] = [];
  const stepIds = new Set(plan.steps.map((s) => s.id));

  const missing = stepsMissingDependencies(plan.steps);
  for (const step of missing) {
    issues.push(
      issue(
        ActionValidationCodes.INVALID_DEPENDENCY,
        `Step ${step.id} references unknown dependency`,
        `steps[${step.id}].dependsOn`,
      ),
    );
  }

  if (hasCircularDependencies(plan.steps)) {
    issues.push(
      issue(
        ActionValidationCodes.CIRCULAR_DEPENDENCY,
        "Circular step dependencies detected",
        "steps",
      ),
    );
  }

  plan.dependencies.forEach((dep, index) => {
    if (!dep.id.trim() || !dep.fromStepId.trim() || !dep.toStepId.trim()) {
      issues.push(
        issue(
          ActionValidationCodes.INVALID_DEPENDENCY,
          "Dependency requires id, fromStepId, and toStepId",
          `dependencies[${index}]`,
        ),
      );
    }
    if (!stepIds.has(dep.fromStepId) || !stepIds.has(dep.toStepId)) {
      issues.push(
        issue(
          ActionValidationCodes.INVALID_DEPENDENCY,
          "Dependency endpoints must reference plan steps",
          `dependencies[${index}]`,
        ),
      );
    }
  });

  return Object.freeze(issues);
}
